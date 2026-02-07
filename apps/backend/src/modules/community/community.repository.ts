import { injectable, inject } from "inversify";
import { PrismaClient, Community, Prisma } from "../../generated/prisma/client";
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

    async findByName(name: string, userId?: string): Promise<(Community & { _count: { members: number; posts: number }; members?: { userId: string }[] }) | null> {
        return this.prisma.community.findUnique({
            where: { name },
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


    get client() {
        return this.prisma;
    }
}
