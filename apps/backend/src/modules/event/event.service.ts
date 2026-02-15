import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { EventRepository } from "./event.repository";
import {
    EventStatus,
    EventType,
    NotificationType,
    CipherReason,
    Prisma
} from "../../generated/prisma/client";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { NotificationService } from "../notification/notification.service";
import { CipherService } from "../cipher/cipher.service";
import { AuraService } from "../aura/aura.service";
import { CommunityRepository } from "../community/community.repository";
import { CreateEventInput, UpdateEventInput, EventRegistrationInput } from "@devio/zod-utils";
import slugify from "slugify";

@injectable()
export class EventService {
    constructor(
        @inject(TYPES.EventRepository) private eventRepository: EventRepository,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.AuraService) private auraService: AuraService,
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
    ) { }

    async createEvent(userId: string, data: CreateEventInput) {
        if (data.communityId) {
            const isAuthorized = await this.communityRepository.isModeratorOrCreator(data.communityId, userId);
            if (!isAuthorized) {
                throw new ApiError("Only community moderators can create events for this community", StatusCodes.FORBIDDEN);
            }
        }

        const slug = slugify(data.title, { lower: true, strict: true }) + "-" + Math.random().toString(36).substring(2, 7);

        const eventData: Prisma.EventCreateInput = {
            ...data,
            slug,
            createdBy: { connect: { id: userId } },
            ...(data.communityId && { community: { connect: { id: data.communityId } } }),
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
    }) {
        const events = await this.eventRepository.findMany({
            ...params,
            limit: params.limit || 10,
            isApproved: params.status === EventStatus.PUBLISHED ? true : undefined,
        });

        let nextCursor: string | null = null;
        if (events.length > params.limit) {
            const nextItem = events.pop();
            nextCursor = nextItem?.id || null;
        }

        return { events, nextCursor };
    }

    async getEventById(id: string, currentUserId?: string) {
        const event = await this.eventRepository.findById(id, currentUserId);
        if (!event) {
            throw new ApiError("Event not found", StatusCodes.NOT_FOUND);
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

        const updatedEvent = await this.eventRepository.update(id, data as Prisma.EventUpdateInput);

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
}
