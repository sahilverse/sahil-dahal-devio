import { injectable, inject } from "inversify";
import { PrismaClient, Community, Prisma, CommunityJoinRequest, JoinRequestStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CommunityRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(
        data: Prisma.CommunityCreateInput,
        tx?: Prisma.TransactionClient
    ): Promise<Community> {
        const client = tx || this.prisma;
        return client.community.create({ data });
    }

    async countActiveMembers(communityId: string) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Get users who posted
        const posters = await this.prisma.post.findMany({
            where: {
                communityId,
                createdAt: { gte: sevenDaysAgo }
            },
            select: { authorId: true },
            distinct: ['authorId']
        });

        // 2. Get users who commented on posts in this community
        const commenters = await this.prisma.comment.findMany({
            where: {
                post: { communityId },
                createdAt: { gte: sevenDaysAgo }
            },
            select: { authorId: true },
            distinct: ['authorId']
        });

        // 3. Merge unique IDs
        const uniqueActiveUserIds = new Set([
            ...posters.map(p => p.authorId),
            ...commenters.map(c => c.authorId)
        ]);

        return uniqueActiveUserIds.size;
    }

    async getModerators(communityId: string, limit: number = 10, cursor?: string) {
        return this.prisma.communityMember.findMany({
            where: {
                communityId,
                isMod: true
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor
                }
            }),
            orderBy: {
                joinedAt: 'asc'
            },
            select: {
                id: true,
                joinedAt: true,
                permissions: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });
    }

    async createJoinRequest(communityId: string, userId: string, message?: string): Promise<CommunityJoinRequest> {
        return this.prisma.communityJoinRequest.create({
            data: { communityId, userId, message }
        });
    }

    async findPendingJoinRequests(communityId: string, limit: number, cursor?: string) {
        return this.prisma.communityJoinRequest.findMany({
            where: { communityId, status: JoinRequestStatus.PENDING },
            take: limit,
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateJoinRequest(requestId: string, status: JoinRequestStatus, reviewedById: string) {
        return this.prisma.communityJoinRequest.update({
            where: { id: requestId },
            data: {
                status,
                reviewedById,
                reviewedAt: new Date()
            }
        });
    }

    async findJoinRequest(requestId: string) {
        return this.prisma.communityJoinRequest.findUnique({
            where: { id: requestId },
            include: { community: true }
        });
    }

    async updateSettings(communityId: string, data: any) {
        const communityFields = ['description', 'visibility'];
        const settingsFields = ['allowPostImages', 'allowPostLinks', 'requirePostApproval', 'minAuraToPost', 'minAuraToComment'];

        const communityUpdate: any = {};
        const settingsUpdate: any = {};

        Object.keys(data).forEach(key => {
            if (communityFields.includes(key)) communityUpdate[key] = data[key];
            if (settingsFields.includes(key)) settingsUpdate[key] = data[key];
        });

        return this.prisma.$transaction(async (tx) => {
            if (Object.keys(communityUpdate).length > 0) {
                await tx.community.update({
                    where: { id: communityId },
                    data: communityUpdate
                });
            }

            if (Object.keys(settingsUpdate).length > 0) {
                await tx.communitySettings.update({
                    where: { communityId },
                    data: settingsUpdate
                });
            }

            return { success: true };
        });
    }

    async findSettings(communityId: string) {
        return this.prisma.communitySettings.findUnique({
            where: { communityId }
        });
    }

    async updateRules(communityId: string, rules: any) {
        return this.prisma.community.update({
            where: { id: communityId },
            data: { rules }
        });
    }

    async updateMedia(communityId: string, data: { iconUrl?: string | null, bannerUrl?: string | null }) {
        return this.prisma.community.update({
            where: { id: communityId },
            data
        });
    }

    async getMembers(communityId: string, limit: number = 10, cursor?: string, query?: string) {
        return this.prisma.communityMember.findMany({
            where: {
                communityId,
                ...(query && {
                    user: {
                        username: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                })
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            }),
            orderBy: {
                joinedAt: 'desc'
            },
            select: {
                id: true,
                joinedAt: true,
                isMod: true,
                permissions: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });
    }

    async addMember(communityId: string, userId: string, isMod: boolean = false) {
        return this.prisma.communityMember.upsert({
            where: { communityId_userId: { communityId, userId } },
            create: { communityId, userId, isMod },
            update: { isMod }
        });
    }

    async removeMember(communityId: string, userId: string) {
        return this.prisma.communityMember.delete({
            where: { communityId_userId: { communityId, userId } }
        });
    }

    async findByName(name: string, userId?: string): Promise<(Community & { _count: { members: number; posts: number }; members?: { userId: string }[] }) | null> {
        return this.prisma.community.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                },
                ...(userId && {
                    members: {
                        where: { userId },
                        select: { userId: true },
                        take: 1
                    }
                })
            }
        });
    }

    async findJoinedCommunities(userId: string, limit: number, cursor?: string, query?: string): Promise<any[]> {
        const where: any = { userId };

        if (query) {
            where.community = {
                name: { contains: query, mode: 'insensitive' },
            };
        }

        return this.prisma.communityMember.findMany({
            where,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { joinedAt: 'desc' },
            include: {
                community: {
                    select: {
                        id: true,
                        name: true,
                        iconUrl: true,
                        _count: {
                            select: { members: true }
                        }
                    }
                }
            }
        });
    }

    async updateMemberPermissions(communityId: string, userId: string, isMod: boolean, permissions: any) {
        return this.prisma.communityMember.update({
            where: { communityId_userId: { communityId, userId } },
            data: { isMod, permissions }
        });
    }

    async isModeratorOrCreator(communityId: string, userId: string): Promise<boolean> {
        const [membership, community] = await Promise.all([
            this.prisma.communityMember.findUnique({
                where: { communityId_userId: { communityId, userId } },
                select: { isMod: true }
            }),
            this.prisma.community.findUnique({
                where: { id: communityId },
                select: { createdById: true }
            })
        ]);

        return !!membership?.isMod || community?.createdById === userId;
    }

    async checkMemberPermission(communityId: string, userId: string, permission: string): Promise<boolean> {
        const [membership, community] = await Promise.all([
            this.prisma.communityMember.findUnique({
                where: { communityId_userId: { communityId, userId } },
                select: { isMod: true, permissions: true }
            }),
            this.prisma.community.findUnique({
                where: { id: communityId },
                select: { createdById: true }
            })
        ]);

        if (community?.createdById === userId) return true;
        if (!membership?.isMod) return false;

        const perms = membership.permissions as any;
        return !!perms?.everything || !!perms?.[permission];
    }

    async search(query: string, limit: number, cursor?: string): Promise<Community[]> {
        return this.prisma.community.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ],
                visibility: 'PUBLIC'
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            }),
            orderBy: { name: 'asc' }
        });
    }

    async trackView(communityId: string, userId?: string): Promise<void> {
        await this.prisma.communityView.create({
            data: { communityId, userId }
        });
    }

    async getWeeklyStats(communityId: string): Promise<{ visitors: number; contributors: number }> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [visitors, contributors] = await Promise.all([
            // 1. Visitors (unique users or distinct views if guests)
            this.prisma.communityView.count({
                where: {
                    communityId,
                    viewedAt: { gte: sevenDaysAgo }
                },
            }),
            // 2. Contributors (unique users who posted or commented)
            this.prisma.post.count({
                where: {
                    communityId,
                    createdAt: { gte: sevenDaysAgo }
                },
            }).then(async () => {
                const posters = await this.prisma.post.findMany({
                    where: { communityId, createdAt: { gte: sevenDaysAgo } },
                    select: { authorId: true },
                    distinct: ['authorId']
                });
                const commenters = await this.prisma.comment.findMany({
                    where: { post: { communityId }, createdAt: { gte: sevenDaysAgo } },
                    select: { authorId: true },
                    distinct: ['authorId']
                });
                const uniqueIds = new Set([...posters.map(p => p.authorId), ...commenters.map(c => c.authorId)]);
                return uniqueIds.size;
            })
        ]);

        return { visitors, contributors };
    }


    get client() {
        return this.prisma;
    }
}
