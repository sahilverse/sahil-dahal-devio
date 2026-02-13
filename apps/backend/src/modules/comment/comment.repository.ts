import { injectable, inject } from "inversify";
import { PrismaClient, Comment, Prisma, MediaType } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CommentRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    get client() {
        return this.prisma;
    }

    private getCommentInclude(currentUserId?: string) {
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
            media: true,
            _count: {
                select: { replies: true }
            },
            ...(currentUserId && {
                votes: { where: { userId: currentUserId } },
            }),
        };
    }

    async create(
        data: {
            postId: string;
            authorId: string;
            content: string;
            parentId?: string;
        },
        mediaData: { url: string; type: MediaType; fileName: string; fileSize: number }[] = []
    ): Promise<Comment> {
        return this.prisma.$transaction(async (tx) => {
            const comment = await tx.comment.create({
                data: {
                    postId: data.postId,
                    authorId: data.authorId,
                    content: data.content,
                    parentId: data.parentId || null,
                    media: {
                        create: mediaData.map((m, index) => ({
                            url: m.url,
                            type: m.type,
                            fileName: m.fileName,
                            fileSize: m.fileSize,
                            position: index,
                        })),
                    },
                },
                include: this.getCommentInclude(),
            });

            // Increment post commentCount
            await tx.post.update({
                where: { id: data.postId },
                data: { commentCount: { increment: 1 } },
            });

            return comment;
        });
    }

    async findById(id: string, currentUserId?: string): Promise<Comment | null> {
        return this.prisma.comment.findUnique({
            where: { id },
            include: this.getCommentInclude(currentUserId),
        });
    }

    async findByPostId(
        postId: string,
        options: {
            cursor?: string;
            limit: number;
            sort: "best" | "newest" | "oldest";
            currentUserId?: string;
            replyPreviewLimit?: number;
        }
    ) {
        const { cursor, limit, sort, currentUserId, replyPreviewLimit = 3 } = options;

        // Look up the accepted answer to pin it to the top
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { acceptedAnswerId: true },
        });
        const acceptedAnswerId = post?.acceptedAnswerId;

        let orderBy: Prisma.CommentOrderByWithRelationInput[];
        switch (sort) {
            case "newest":
                orderBy = [{ createdAt: "desc" }];
                break;
            case "oldest":
                orderBy = [{ createdAt: "asc" }];
                break;
            case "best":
            default:
                orderBy = [{ upvotes: "desc" }, { createdAt: "desc" }];
                break;
        }

        const comments = await this.prisma.comment.findMany({
            where: {
                postId,
                parentId: null, // Top-level comments only
                deletedAt: null, // Hide deleted comments
            },
            take: limit + 1, // +1 for cursor pagination
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy,
            include: {
                ...this.getCommentInclude(currentUserId),
                replies: {
                    where: { deletedAt: null },
                    take: replyPreviewLimit,
                    orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
                    include: this.getCommentInclude(currentUserId),
                },
            },
        });

        // Pin accepted answer to the top
        if (acceptedAnswerId) {
            const acceptedIdx = comments.findIndex(c => c.id === acceptedAnswerId);
            if (acceptedIdx > 0) {
                const [accepted] = comments.splice(acceptedIdx, 1);
                if (accepted) comments.unshift(accepted);
            }
        }

        return comments;
    }

    async findReplies(
        parentId: string,
        options: {
            cursor?: string;
            limit: number;
            currentUserId?: string;
        }
    ) {
        const { cursor, limit, currentUserId } = options;

        return this.prisma.comment.findMany({
            where: {
                parentId,
                deletedAt: null // Hide deleted replies
            },
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
            include: this.getCommentInclude(currentUserId),
        });
    }

    async update(id: string, content: string, currentUserId?: string): Promise<Comment> {
        return this.prisma.comment.update({
            where: { id },
            data: { content },
            include: this.getCommentInclude(currentUserId),
        });
    }

    async softDelete(id: string): Promise<Comment> {
        return this.prisma.$transaction(async (tx) => {
            const comment = await tx.comment.update({
                where: { id },
                data: {
                    content: "[deleted]",
                    deletedAt: new Date(),
                },
                include: this.getCommentInclude(),
            });

            // Decrement post commentCount
            await tx.post.update({
                where: { id: comment.postId },
                data: { commentCount: { decrement: 1 } },
            });

            return comment;
        });
    }

    async getVote(commentId: string, userId: string) {
        return this.prisma.commentVote.findUnique({
            where: { commentId_userId: { commentId, userId } },
        });
    }

    async vote(commentId: string, userId: string, type: "UP" | "DOWN" | null): Promise<Comment> {
        return this.prisma.$transaction(async (tx) => {
            const existingVote = await tx.commentVote.findUnique({
                where: { commentId_userId: { commentId, userId } },
            });

            // 1. Remove existing vote if clicking same or if type is null
            if (existingVote) {
                if (existingVote.type === type || type === null) {
                    await tx.commentVote.delete({
                        where: { id: existingVote.id },
                    });

                    return tx.comment.update({
                        where: { id: commentId },
                        data: {
                            [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        },
                        include: this.getCommentInclude(userId),
                    });
                }

                // 2. Switch vote type
                await tx.commentVote.update({
                    where: { id: existingVote.id },
                    data: { type },
                });

                return tx.comment.update({
                    where: { id: commentId },
                    data: {
                        [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getCommentInclude(userId),
                });
            }

            // 3. New vote
            if (type !== null) {
                await tx.commentVote.create({
                    data: { commentId, userId, type },
                });

                return tx.comment.update({
                    where: { id: commentId },
                    data: {
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getCommentInclude(userId),
                });
            }

            // Fallback
            return tx.comment.findUnique({
                where: { id: commentId },
                include: this.getCommentInclude(userId),
            }) as Promise<Comment>;
        });
    }
}
