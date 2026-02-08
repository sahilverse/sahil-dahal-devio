
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CommunityRepository } from "./community.repository";
import { CreateCommunityInput } from "@devio/zod-utils";
import { plainToInstance } from "class-transformer";
import { CommunityResponseDto } from "./community.dto";
import { TopicService } from "../topic/topic.service";

@injectable()
export class CommunityService {
    constructor(
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
        @inject(TYPES.TopicService) private topicService: TopicService
    ) { }

    async createCommunity(userId: string, data: CreateCommunityInput): Promise<CommunityResponseDto> {
        // 1. Check Name Uniqueness
        const existing = await this.communityRepository.findByName(data.name);
        if (existing) {
            throw new ApiError("Community name already taken", StatusCodes.CONFLICT);
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

        return plainToInstance(CommunityResponseDto, community, { excludeExtraneousValues: true });
    }

    async getCommunityByName(name: string, userId?: string): Promise<CommunityResponseDto> {
        const community = await this.communityRepository.findByName(name, userId);
        if (!community) {
            throw new ApiError("Community not found", StatusCodes.NOT_FOUND);
        }

        const isMember = community.members && community.members.length > 0;

        // Access Control
        if (community.visibility === "PRIVATE" && !isMember) {
            throw new ApiError("This community is private. Only members can view it.", StatusCodes.FORBIDDEN);
        }

        const response = plainToInstance(CommunityResponseDto, community, { excludeExtraneousValues: true });
        response.memberCount = community._count?.members || 0;
        response.isMember = !!isMember;

        // Map Active Members Count
        response.activeMembers = await this.communityRepository.countActiveMembers(community.id);

        // Fetch Moderators 
        const mods = await this.communityRepository.getModerators(community.id, 10);
        response.moderators! = mods.map(m => ({
            id: m.user.id,
            username: m.user.username!,
            avatarUrl: m.user.avatarUrl || undefined
        }));

        return response;
    }
    async getCommunityModerators(name: string, limit: number = 10, cursor?: string): Promise<any> {
        const community = await this.communityRepository.findByName(name);

        if (!community) {
            throw new ApiError("Community not found", StatusCodes.NOT_FOUND);
        }
        const mods = await this.communityRepository.getModerators(community.id, limit + 1, cursor);

        let nextCursor: string | undefined = undefined;
        if (mods.length > limit) {
            const nextItem = mods.pop();
            nextCursor = nextItem?.id;
        }
        const moderators = mods.map(m => ({
            id: m.user.id,
            username: m.user.username!,
            avatarUrl: m.user.avatarUrl || undefined,
            joinedAt: m.joinedAt
        }));

        return {
            moderators,
            nextCursor
        };
    }
}
