import { injectable, inject } from "inversify";
import { PrismaClient, Post, Prisma, PostStatus, PostVisibility, CommunityVisibility } from "../../generated/prisma/client";
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
    }): Promise<Post[]> {
        const { cursor, limit, userId, communityId, currentUserId } = params;

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
                status: PostStatus.PUBLISHED,
                ...(!isOwner && {
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

    get client() {
        return this.prisma;
    }
}
