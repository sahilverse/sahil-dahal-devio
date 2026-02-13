import { injectable, inject } from "inversify";
import { PrismaClient, Post, Prisma, PostStatus, PostVisibility, CommunityVisibility, Media } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class PostRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    private getPostInclude(currentUserId?: string) {
        return {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                },
            },
            community: true,
            media: true,
            topics: { include: { topic: true } },
            pollOptions: true,
            pinnedPosts: true,
            ...(currentUserId && {
                votes: { where: { userId: currentUserId } },
                savePosts: { where: { userId: currentUserId } },
            }),
        };
    }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return this.prisma.post.create({ data, include: this.getPostInclude() });
    }

    async findById(id: string, currentUserId?: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id },
            include: this.getPostInclude(currentUserId)
        });
    }

    async createPostWithTransaction(
        transactionFn: (tx: Prisma.TransactionClient) => Promise<Post>
    ): Promise<Post> {
        return this.prisma.$transaction(transactionFn);
    }

    async findMany(params: {
        cursor?: string;
        limit: number;
        userId?: string;
        communityId?: string;
        currentUserId?: string;
        status?: PostStatus;
        visibility?: PostVisibility;
        savedByUserId?: string;
        sortBy?: "HOT" | "NEW" | "TOP" | "BEST";
    }): Promise<Post[]> {
        const { cursor, limit, userId, communityId, currentUserId, status, visibility, savedByUserId, sortBy } = params;

        const isOwner = userId && currentUserId && userId === currentUserId;

        const shouldSortByPin = (userId || communityId) && !savedByUserId;

        const personalizedFilter: Prisma.PostWhereInput = {};
        if (sortBy === "BEST" && currentUserId && !userId && !communityId) {
            personalizedFilter.OR = [
                {
                    community: {
                        members: { some: { userId: currentUserId } }
                    }
                },
                {
                    author: {
                        followers: { some: { followerId: currentUserId } }
                    }
                }
            ];
        }

        const getOrderBy = () => {
            if (shouldSortByPin) {
                return [
                    { pinnedPosts: { _count: "desc" as Prisma.SortOrder } },
                    { createdAt: "desc" } as any
                ];
            }

            switch (sortBy) {
                case "NEW":
                    return { createdAt: "desc" };
                case "TOP":
                    return { upvotes: "desc" };
                case "HOT":
                    return [
                        { upvotes: "desc" },
                        { commentCount: "desc" },
                        { createdAt: "desc" }
                    ];
                case "BEST":
                default:
                    return { createdAt: "desc" };
            }
        };

        return this.prisma.post.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            where: {
                ...(userId && { authorId: userId }),
                ...(communityId && {
                    communityId,
                    community: {
                        OR: [
                            { visibility: CommunityVisibility.PUBLIC },
                            ...(currentUserId ? [{ members: { some: { userId: currentUserId } } }] : [])
                        ]
                    }
                }),
                ...personalizedFilter,

                ...(status
                    ? { status: status === PostStatus.DRAFT && !isOwner ? PostStatus.PUBLISHED : status }
                    : { status: PostStatus.PUBLISHED }
                ),
                ...(visibility && { visibility }),
                ...(!isOwner && !communityId && !savedByUserId && {
                    visibility: PostVisibility.PUBLIC
                }),
                ...(savedByUserId && {
                    savePosts: {
                        some: { userId: savedByUserId }
                    }
                })
            },
            orderBy: getOrderBy() as any,
            include: this.getPostInclude(currentUserId),
        });
    }

    async update(id: string, data: Prisma.PostUpdateInput, currentUserId?: string): Promise<Post> {
        return this.prisma.post.update({
            where: { id },
            data,
            include: this.getPostInclude(currentUserId),
        });
    }

    async delete(id: string): Promise<Post & { media: Media[] }> {
        return this.prisma.post.delete({
            where: { id },
            include: { media: true }
        }) as unknown as Promise<Post & { media: Media[] }>;
    }

    async count(params: {
        userId?: string;
        status?: PostStatus;
        visibility?: PostVisibility;
    }): Promise<number> {
        const { userId, status, visibility } = params;
        return this.prisma.post.count({
            where: {
                ...(userId && { authorId: userId }),
                ...(status && { status }),
                ...(visibility && { visibility }),
            },
        });
    }

    async vote(postId: string, userId: string, type: "UP" | "DOWN" | null): Promise<Post> {
        return this.prisma.$transaction(async (tx) => {
            const existingVote = await tx.postVote.findUnique({
                where: { postId_userId: { postId, userId } },
            });

            // 1. Remove existing vote if clicking same or if type is null
            if (existingVote) {
                if (existingVote.type === type || type === null) {
                    await tx.postVote.delete({
                        where: { id: existingVote.id },
                    });

                    return tx.post.update({
                        where: { id: postId },
                        data: {
                            [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        },
                        include: this.getPostInclude(userId),
                    });
                }

                // 2. Switch vote type
                await tx.postVote.update({
                    where: { id: existingVote.id },
                    data: { type },
                });

                return tx.post.update({
                    where: { id: postId },
                    data: {
                        [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getPostInclude(userId),
                });
            }

            // 3. New vote
            if (type !== null) {
                await tx.postVote.create({
                    data: { postId, userId, type },
                });

                return tx.post.update({
                    where: { id: postId },
                    data: {
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getPostInclude(userId),
                });
            }

            // Fallback for null type with no existing vote
            return tx.post.findUnique({
                where: { id: postId },
                include: this.getPostInclude(userId)
            }) as Promise<Post>;
        });
    }

    async toggleSave(postId: string, userId: string): Promise<boolean> {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.savePost.findUnique({
                where: { postId_userId: { postId, userId } },
            });

            if (existing) {
                await tx.savePost.delete({ where: { id: existing.id } });
                return false; // Not saved
            }

            await tx.savePost.create({ data: { postId, userId } });
            return true; // Saved
        });
    }

    async getVote(postId: string, userId: string) {
        return this.prisma.postVote.findUnique({
            where: { postId_userId: { postId, userId } },
        });
    }

    async countPinnedPosts(userId?: string, communityId?: string): Promise<number> {
        return this.prisma.pinnedPost.count({
            where: {
                ...(communityId ? { communityId } : { userId })
            }
        });
    }

    async togglePin(postId: string, isPinned: boolean, currentUserId?: string, communityId?: string): Promise<Post> {
        return this.prisma.$transaction(async (tx) => {
            if (isPinned) {
                // Pin the post
                await tx.pinnedPost.upsert({
                    where: {
                        ...(communityId
                            ? { postId_communityId: { postId, communityId } }
                            : { postId_userId: { postId, userId: currentUserId! } })
                    },
                    create: {
                        postId,
                        userId: communityId ? null : currentUserId,
                        communityId: communityId || null
                    },
                    update: {}
                });
            } else {
                await tx.pinnedPost.deleteMany({
                    where: {
                        postId,
                        ...(communityId ? { communityId } : { userId: currentUserId })
                    }
                });
            }

            return tx.post.findUnique({
                where: { id: postId },
                include: this.getPostInclude(currentUserId),
            }) as Promise<Post>;
        });
    }

    get client() {
        return this.prisma;
    }
}
