import { injectable, inject } from "inversify";
import { PrismaClient, Post, Prisma, PostStatus, PostVisibility, CommunityVisibility, Media } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class PostRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return this.prisma.post.create({ data });
    }

    async findById(id: string): Promise<Post | null> {
        return this.prisma.post.findUnique({ where: { id } });
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
    }): Promise<Post[]> {
        const { cursor, limit, userId, communityId, currentUserId, status, visibility } = params;

        const isOwner = userId && currentUserId && userId === currentUserId;

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

                ...(status
                    ? { status: status === PostStatus.DRAFT && !isOwner ? PostStatus.PUBLISHED : status }
                    : { status: PostStatus.PUBLISHED }
                ),
                ...(visibility && { visibility }),
                ...(!isOwner && !communityId && {
                    visibility: PostVisibility.PUBLIC
                })
            },
            orderBy: { createdAt: "desc" },
            include: {
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
            },
        });
    }

    async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
        return this.prisma.post.update({
            where: { id },
            data,
            include: {
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
            },
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

    get client() {
        return this.prisma;
    }
}
