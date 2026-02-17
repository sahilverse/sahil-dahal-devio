import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { EventRepository } from "./event.repository";
import {
    EventStatus,
    EventType,
    NotificationType,
    CipherReason,
    Prisma,
    EventVisibility
} from "../../generated/prisma/client";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "../notification/notification.service";
import { CipherService } from "../cipher/cipher.service";
import { AuraService } from "../aura/aura.service";
import { CommunityRepository } from "../community/community.repository";
import { CreateEventInput, UpdateEventInput, EventRegistrationInput } from "@devio/zod-utils";
import slugify from "slugify";
import { StorageService } from "../storage/storage.service";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

@injectable()
export class EventService {
    constructor(
        @inject(TYPES.EventRepository) private eventRepository: EventRepository,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.AuraService) private auraService: AuraService,
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
    ) { }

    async createEvent(userId: string, data: CreateEventInput) {
        if (data.communityId) {
            const isAuthorized = await this.communityRepository.isModeratorOrCreator(data.communityId, userId);
            if (!isAuthorized) {
                throw new ApiError("Only community moderators can create events for this community", StatusCodes.FORBIDDEN);
            }
        }

        const slug = slugify(data.title, { lower: true, strict: true }) + "-" + Math.random().toString(36).substring(2, 7);

        const { prizes, rules, ...rest } = data;

        const eventData: Prisma.EventCreateInput = {
            ...rest,
            slug,
            createdBy: { connect: { id: userId } },
            ...(data.communityId && { community: { connect: { id: data.communityId } } }),
            rules: rules,
            prizes: prizes ? {
                create: prizes.map(p => ({
                    rankFrom: p.rank,
                    rankTo: p.rank,
                    prize: p.prize,
                    description: p.description,
                }))
            } : undefined,
            isApproved: true,
        };

        delete (eventData as any).communityId;

        const event = await this.eventRepository.create(eventData);

        logger.info(`Event created: ${event.id} by user ${userId}`);
        return event;
    }

    async getEvents(params: {
        cursor?: string;
        limit: number;
        status?: EventStatus;
        type?: EventType;
        communityId?: string;
        currentUserId?: string;
        visibility?: EventVisibility;
    }) {
        const events = await this.eventRepository.findMany({
            ...params,
            limit: params.limit || 10,
            isApproved: params.status === EventStatus.PUBLISHED ? true : false,
            visibility: params.visibility ?? EventVisibility.PUBLIC,
        });

        let nextCursor: string | null = null;
        if (events.length > params.limit) {
            const nextItem = events.pop();
            nextCursor = nextItem?.id || null;
        }

        return { events, nextCursor };
    }

    async getEventById(idOrSlug: string, currentUserId?: string) {
        let event = await this.eventRepository.findById(idOrSlug, currentUserId);

        if (!event) {
            event = await this.eventRepository.findBySlug(idOrSlug, currentUserId);
        }

        if (!event) {
            throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
        }

        if (currentUserId) {
            const isCreator = event.createdById === currentUserId;
            let isModerator = false;
            if (!isCreator && event.communityId) {
                isModerator = await this.communityRepository.isModeratorOrCreator(event.communityId, currentUserId);
            }
            (event as any).canEdit = isCreator || isModerator;
        }

        return event;
    }

    async updateEvent(id: string, userId: string, data: UpdateEventInput) {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
        }

        if (event.createdById !== userId) {
            if (event.communityId) {
                const isAuthorized = await this.communityRepository.isModeratorOrCreator(event.communityId, userId);
                if (!isAuthorized) {
                    throw new ApiError("Only community moderators can update events for this community", StatusCodes.FORBIDDEN);
                }
            } else {
                throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
            }
        }

        const { prizes, rules, ...rest } = data;

        const updateData: Prisma.EventUpdateInput = {
            ...rest,
            rules: rules,
            prizes: prizes ? {
                deleteMany: {},
                create: prizes.map(p => ({
                    rankFrom: p.rank,
                    rankTo: p.rank,
                    prize: p.prize,
                    description: p.description,
                }))
            } : undefined,
        };

        const updatedEvent = await this.eventRepository.update(id, updateData);

        if (updatedEvent.status === EventStatus.PUBLISHED || updatedEvent.status === EventStatus.ONGOING) {
            const participants = await this.eventRepository.getLeaderboard(id);

            // THIS SHOULD BE IN BACKGROUND BUT FOR NOW IT'S FINE.
            // TODO: YO PAXI NIKALNAI PARNEY HUNXA YAHA BATA.
            if (participants.length > 0) {
                const notificationPromises = participants.map(participant =>
                    this.notificationService.notify({
                        userId: participant.userId,
                        type: "EVENT_UPDATE" as NotificationType,
                        title: "Event Updated",
                        message: `The event "${updatedEvent.title}" has been updated.`,
                        actionUrl: `/events/${updatedEvent.slug}`,
                        data: { eventId: updatedEvent.id, slug: updatedEvent.slug }
                    })
                );
                await Promise.all(notificationPromises).catch(err =>
                    logger.error(`Failed to send some update notifications for event ${id}: ${err.message}`)
                );
            }
        }

        return updatedEvent;
    }

    async registerForEvent(eventId: string, userId: string, data?: EventRegistrationInput) {
        const event = await this.getEventById(eventId);

        if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.ONGOING) {
            throw new ApiError("Registration is not open for this event", StatusCodes.BAD_REQUEST);
        }

        if (new Date() > new Date(event.endsAt)) {
            throw new ApiError("Event has already ended", StatusCodes.BAD_REQUEST);
        }

        // Check if already registered
        const existingParticipant = await this.eventRepository.findParticipant(eventId, userId);
        if (existingParticipant) {
            throw new ApiError("You are already registered for this event", StatusCodes.BAD_REQUEST);
        }

        // Check Max Participants
        if (event.maxParticipants && event._count.participants >= event.maxParticipants) {
            throw new ApiError("Event is full", StatusCodes.BAD_REQUEST);
        }

        // Check Aura Points Requirement
        const userAura = await this.auraService.getPoints(userId);
        if (userAura < event.minAuraPoints) {
            throw new ApiError(`Insufficient Aura Points. Required: ${event.minAuraPoints}`, StatusCodes.BAD_REQUEST);
        }

        // Check Community Membership
        if (event.communityId) {
            const membership = await this.communityRepository.findMember(event.communityId, userId);
            if (!membership) {
                throw new ApiError("You must be a member of this community to join its events", StatusCodes.FORBIDDEN);
            }
        }

        // Handle Cipher Cost
        if (event.entryCipherCost > 0) {
            await this.cipherService.spendCipher(
                userId,
                event.entryCipherCost,
                CipherReason.CONTEST_ENTRY,
                eventId
            );
        }

        const participant = await this.eventRepository.registerParticipant(eventId, userId, data);

        // Send Notification
        await this.notificationService.notify({
            userId,
            type: "EVENT_REGISTRATION" as NotificationType,
            title: "Event Registration Successful",
            message: `You have successfully registered for ${event.title}!`,
            actionUrl: `/events/${event.slug}`,
            data: { eventId, slug: event.slug }
        });

        return participant;
    }

    async getLeaderboard(eventId: string) {
        return this.eventRepository.getLeaderboard(eventId);
    }

    async uploadEventImage(eventId: string, userId: string, file: Express.Multer.File): Promise<string> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new ApiError("Event not found", StatusCodes.NOT_FOUND);

        // Verify ownership
        if (event.createdById !== userId) {
            if (event.communityId) {
                const isAuthorized = await this.communityRepository.isModeratorOrCreator(event.communityId, userId);
                if (!isAuthorized) {
                    throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
                }
            } else {
                throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
            }
        }

        // Delete old image if it exists
        if (event.imageUrl) {
            await this.storageService.deleteFile(event.imageUrl);
        }

        const datePath = format(new Date(), "yyyy/MM/dd");
        const filename = `${uuidv4()}.webp`;
        const path = `events/${datePath}/${filename}`;

        const imageUrl = await this.storageService.uploadFile(file, path);
        await this.eventRepository.update(eventId, { imageUrl });

        logger.info(`Event image uploaded for event ${eventId} by user ${userId}`);
        return imageUrl;
    }

    async removeEventImage(eventId: string, userId: string): Promise<void> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new ApiError("Event not found", StatusCodes.NOT_FOUND);

        if (event.createdById !== userId) {
            if (event.communityId) {
                const isAuthorized = await this.communityRepository.isModeratorOrCreator(event.communityId, userId);
                if (!isAuthorized) {
                    throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
                }
            } else {
                throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
            }
        }

        if (event.imageUrl) {
            await this.storageService.deleteFile(event.imageUrl);
        }

        await this.eventRepository.update(eventId, { imageUrl: null });
    }
    async addEventProblem(eventId: string, userId: string, problemId: string, points: number, order: number): Promise<void> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new ApiError("Event not found", StatusCodes.NOT_FOUND);

        // Verify ownership
        await this.verifyEventModification(event, userId);

        try {
            await this.eventRepository.addProblem(eventId, problemId, points, order);
        } catch (error: any) {
            if (error.code === 'P2002') { 
                throw new ApiError("Problem already added to this event", StatusCodes.CONFLICT);
            }
            throw error;
        }
    }

    async removeEventProblem(eventId: string, userId: string, problemId: string): Promise<void> {
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new ApiError("Event not found", StatusCodes.NOT_FOUND);

        // Verify ownership
        await this.verifyEventModification(event, userId);

        try {
            await this.eventRepository.removeProblem(eventId, problemId);
        } catch (error: any) {
            if (error.code === 'P2025') { 
                throw new ApiError("Problem not found in this event", StatusCodes.NOT_FOUND);
            }
            throw error;
        }
    }

    private async verifyEventModification(event: any, userId: string) {
        if (event.createdById !== userId) {
            if (event.communityId) {
                const isAuthorized = await this.communityRepository.isModeratorOrCreator(event.communityId, userId);
                if (!isAuthorized) {
                    throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
                }
            } else {
                throw new ApiError("Unauthorized to update this event", StatusCodes.FORBIDDEN);
            }
        }
    }
}
