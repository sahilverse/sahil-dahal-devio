
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CommunityRepository } from "./community.repository";
import { CreateCommunityInput } from "@devio/zod-utils";
import { plainToInstance } from "class-transformer";
import { CommunityResponseDto, CommunitySettingsDto, CommunityRulesDto, GetMembersResponseDto, CommunityMemberDto, GetModeratorsDto } from "./community.dto";
import { TopicService } from "../topic/topic.service";
import { ActivityService } from "../activity/activity.service";
import { ActivityType, JoinRequestStatus, NotificationType, CommunityVisibility } from "../../generated/prisma/client";
import { NotificationService } from "../notification";
import { StorageService } from "../storage";
import { AuraService } from "../aura/aura.service";
import { logger } from "../../utils";

@injectable()
export class CommunityService {
    constructor(
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
        @inject(TYPES.TopicService) private topicService: TopicService,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.AuraService) private auraService: AuraService
    ) { }

    async createCommunity(userId: string, data: CreateCommunityInput, timezoneOffset?: number): Promise<CommunityResponseDto> {
        // 1. Check Name Uniqueness
        const existing = await this.communityRepository.findByName(data.name);
        if (existing) {
            throw new ApiError({ "name": "Community name already taken" }, StatusCodes.CONFLICT);
        }

        // 2. Transaction
        const community = await this.communityRepository.client.$transaction(async (tx) => {
            const topicIds: string[] = [];
            if (data.topics && data.topics.length > 0) {
                const uniqueTopics = Array.from(new Set(data.topics));

                for (const topicName of uniqueTopics) {
                    const topic = await this.topicService.createTopic(topicName, tx);
                    topicIds.push(topic.id);
                }
            }

            // Create Community
            const com = await tx.community.create({
                data: {
                    name: data.name,
                    description: data.description,
                    visibility: data.visibility,
                    createdById: userId,
                    topics: {
                        create: topicIds.map(topicId => ({
                            topic: { connect: { id: topicId } }
                        }))
                    }
                }
            });

            // Create Settings
            await tx.communitySettings.create({
                data: {
                    communityId: com.id
                }
            });

            // Add Creator as Member 
            await tx.communityMember.create({
                data: {
                    communityId: com.id,
                    userId: userId,
                    isMod: true,
                    permissions: {
                        everything: true,
                        manageUsers: true,
                        manageConfig: true,
                        managePostsAndComments: true
                    },
                }
            });

            return com;
        });

        const response = plainToInstance(CommunityResponseDto, community, { excludeExtraneousValues: true });

        await this.activityService.logActivity(userId, ActivityType.COMMUNITY_CREATE, timezoneOffset);

        return response;
    }

    async getCommunityByName(name: string, userId?: string): Promise<CommunityResponseDto> {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) {
            throw new ApiError("Community not found", StatusCodes.NOT_FOUND);
        }

        const isMember = community.members && community.members.length > 0;

        // Access Control
        if (community.visibility === CommunityVisibility.PRIVATE && !isMember) {
            throw new ApiError("This community is private. Only members can view it.", StatusCodes.FORBIDDEN);
        }

        const response = plainToInstance(CommunityResponseDto, community, { excludeExtraneousValues: true });
        response.memberCount = community._count?.members || 0;
        response.isMember = !!isMember;

        // Map Active Members Count
        response.activeMembers = await this.communityRepository.countActiveMembers(community.id);

        // Fetch Weekly Stats
        const stats = await this.communityRepository.getWeeklyStats(community.id);
        response.weeklyVisitors = stats.visitors;
        response.weeklyContributors = stats.contributors;

        // Track View 
        this.communityRepository.trackView(community.id, userId).catch(err => logger.error(`Failed to track community view: ${err}`));

        return response;
    }

    async getSettings(name: string, userId: string): Promise<CommunitySettingsDto> {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized to view settings", StatusCodes.FORBIDDEN);

        const settings = await this.communityRepository.findSettings(community.id);
        if (!settings) throw new ApiError("Settings not found", StatusCodes.NOT_FOUND);

        return plainToInstance(CommunitySettingsDto, settings, { excludeExtraneousValues: true });
    }

    async getRules(name: string): Promise<CommunityRulesDto> {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        return plainToInstance(CommunityRulesDto, community, { excludeExtraneousValues: true });
    }
    async getMembers(name: string, limit: number, cursor?: string, query?: string, userId?: string): Promise<GetMembersResponseDto> {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMember = community.members && community.members.length > 0;
        if (community.visibility === CommunityVisibility.PRIVATE && !isMember) {
            throw new ApiError("Private community access denied", StatusCodes.FORBIDDEN);
        }

        const members = await this.communityRepository.getMembers(community.id, limit + 1, cursor, query);

        let nextCursor: string | undefined = undefined;
        if (members.length > limit) {
            const lastItem = members.pop();
            nextCursor = lastItem!.id;
        }

        return plainToInstance(GetMembersResponseDto, {
            members: plainToInstance(CommunityMemberDto, members, { excludeExtraneousValues: true }),
            nextCursor
        }, { excludeExtraneousValues: true });
    }

    async searchCommunities(query: string, limit: number, cursor?: string): Promise<{ communities: CommunityResponseDto[], nextCursor?: string }> {
        const communities = await this.communityRepository.search(query, limit + 1, cursor);

        let nextCursor: string | undefined = undefined;
        if (communities.length > limit) {
            const nextItem = communities.pop();
            nextCursor = nextItem?.id;
        }

        const items = plainToInstance(CommunityResponseDto, communities, { excludeExtraneousValues: true });

        for (const item of items) {
            const stats = await this.communityRepository.getWeeklyStats(item.id);
            item.memberCount = (await this.communityRepository.findByName(item.name))?._count.members || 0;
        }

        return { communities: items, nextCursor };
    }

    async getPendingJoinRequests(name: string, userId: string, limit: number, cursor?: string) {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        const requests = await this.communityRepository.findPendingJoinRequests(community.id, limit, cursor);
        return requests;
    }

    async reviewJoinRequest(requestId: string, reviewerId: string, status: JoinRequestStatus) {
        const request = await this.communityRepository.findJoinRequest(requestId);
        if (!request) throw new ApiError("Request not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(request.communityId, reviewerId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        if (request.status !== JoinRequestStatus.PENDING) {
            throw new ApiError("Request already processed", StatusCodes.BAD_REQUEST);
        }

        await this.communityRepository.updateJoinRequest(requestId, status, reviewerId);

        if (status === JoinRequestStatus.APPROVED) {
            await this.communityRepository.addMember(request.communityId, request.userId);
        }

        // Notify User
        await this.notificationService.notify({
            userId: request.userId,
            type: NotificationType.COMMUNITY_JOIN_REQUEST,
            message: `Your request to join ${request.community?.name || 'the community'} was ${status.toLowerCase()}`,
            actionUrl: `/d/${request.community?.name || ''}`
        });

        // Sync Moderator Notifications
        try {
            await this.notificationService.updateNotificationsByData(
                { requestId: request.id },
                {
                    message: `[${status}] ${request.community?.name}: User join request processed`,
                    read_at: new Date()
                }
            );
        } catch (error) {
            logger.error(`Failed to sync mod notifications: ${error}`);
        }

        return { status };
    }

    async updateSettings(name: string, userId: string, data: any) {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        return this.communityRepository.updateSettings(community.id, data);
    }

    async updateRules(name: string, userId: string, rules: any) {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        return this.communityRepository.updateRules(community.id, rules);
    }

    async updateMedia(name: string, userId: string, files: { icon?: Express.Multer.File, banner?: Express.Multer.File }) {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        const updateData: { iconUrl?: string, bannerUrl?: string } = {};

        if (files.icon) {
            const path = `communities/${community.id}/icon-${Date.now()}`;
            updateData.iconUrl = await this.storageService.uploadFile(files.icon, path);
        }

        if (files.banner) {
            const path = `communities/${community.id}/banner-${Date.now()}`;
            updateData.bannerUrl = await this.storageService.uploadFile(files.banner, path);
        }

        return this.communityRepository.updateMedia(community.id, updateData);
    }

    async joinCommunity(name: string, userId: string, message?: string): Promise<{ status: "JOINED" | "REQUEST_SENT" }> {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMember = community.members && community.members.length > 0;
        if (isMember) throw new ApiError("Already a member", StatusCodes.BAD_REQUEST);

        // Aura Check
        const userAura = await this.auraService.getPoints(userId);
        const minAura = community.settings?.minAuraToJoin || 0;
        if (userAura < minAura) {
            throw new ApiError(`You need at least ${minAura} Aura points to join this community`, StatusCodes.FORBIDDEN);
        }

        if (community.visibility === CommunityVisibility.PUBLIC) {
            // Public - Join Directly
            await this.communityRepository.addMember(community.id, userId);
            return { status: "JOINED" };
        } else {
            // Private or Restricted - Create Join Request
            const request = await this.communityRepository.createJoinRequest(community.id, userId, message);

            // Notify All Moderators
            const mods = await this.communityRepository.getModerators(community.id, 50);
            for (const mod of mods) {
                if (mod.user) {
                    await this.notificationService.notify({
                        userId: mod.user.id,
                        type: NotificationType.COMMUNITY_JOIN_REQUEST,
                        message: `A new user wants to join ${community.name}`,
                        actionUrl: `/d/${community.name}/moderation/requests`,
                        data: { requestId: request.id }
                    });
                }
            }

            return { status: "REQUEST_SENT" };
        }
    }

    async leaveCommunity(name: string, userId: string) {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMember = community.members && community.members.length > 0;
        if (!isMember) throw new ApiError("Not a member of this community", StatusCodes.BAD_REQUEST);

        if (community.createdById === userId) {
            throw new ApiError("Creators cannot leave their own community. Transfer ownership first.", StatusCodes.FORBIDDEN);
        }

        return this.communityRepository.removeMember(community.id, userId);
    }

    async getCommunityModerators(name: string, limit: number, cursor?: string): Promise<GetModeratorsDto> {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const mods = await this.communityRepository.getModerators(community.id, limit + 1, cursor);
        let nextCursor: string | undefined = undefined;
        if (mods.length > limit) {
            const nextItem = mods.pop();
            nextCursor = nextItem?.id;
        }

        return plainToInstance(GetModeratorsDto, {
            moderators: plainToInstance(CommunityMemberDto, mods, { excludeExtraneousValues: true }),
            nextCursor
        }, { excludeExtraneousValues: true });
    }

    async updateModeratorPermissions(name: string, adminId: string, targetUserId: string, isMod: boolean, permissions: any) {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        // Only Creator or Mod with 'everything' can manage other mods
        const adminMember = await this.communityRepository.client.communityMember.findUnique({
            where: { communityId_userId: { communityId: community.id, userId: adminId } }
        });

        const isCreator = community.createdById === adminId;
        const hasFullControl = (adminMember?.permissions as any)?.everything;

        if (!isCreator && !hasFullControl) {
            throw new ApiError("Only community creators or full admins can manage moderators", StatusCodes.FORBIDDEN);
        }

        const result = await this.communityRepository.updateMemberPermissions(community.id, targetUserId, isMod, permissions);

        // Notify user about moderator status change
        await this.notificationService.notify({
            userId: targetUserId,
            type: isMod ? NotificationType.COMMUNITY_MODERATOR_ASSIGNED : NotificationType.COMMUNITY_MODERATOR_REMOVED,
            message: isMod
                ? `You have been assigned as a moderator for ${community.name}`
                : `You are no longer a moderator for ${community.name}`,
            actionUrl: `/d/${community.name}`,
            data: { communityId: community.id, isMod }
        }).catch(err => logger.error(`Failed to notify user of moderator change: ${err}`));

        return result;
    }

    async removeMedia(name: string, userId: string, type: 'icon' | 'banner') {
        const community = await this.communityRepository.findByName(name);
        if (!community) throw new ApiError("Community not found", StatusCodes.NOT_FOUND);

        const isMod = await this.communityRepository.isModeratorOrCreator(community.id, userId);
        if (!isMod) throw new ApiError("Not authorized", StatusCodes.FORBIDDEN);

        const oldUrl = type === 'icon' ? community.iconUrl : community.bannerUrl;

        const updateData = type === 'icon' ? { iconUrl: null } : { bannerUrl: null };
        const result = await this.communityRepository.updateMedia(community.id, updateData);

        if (oldUrl) {
            this.storageService.deleteFile(oldUrl).catch(err => logger.warn(`Failed to delete community ${type}: ${err}`));
        }

        return result;
    }

    async getExploreCommunities(limit: number = 10, cursor?: string, topicSlug?: string, userId?: string): Promise<{ topics: any[], nextCursor: string | null }> {
        const topics = await this.communityRepository.getExploreCommunities(limit, cursor, topicSlug, userId);

        let nextCursor: string | null = null;
        if (!topicSlug && topics.length > limit) {
            const lastItem = topics.pop();
            nextCursor = lastItem?.id || null;
        }

        return { topics, nextCursor };
    }
}
