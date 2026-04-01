import { injectable, inject } from "inversify";
import { PrismaClient, VideoStatus } from "../../../generated/prisma/client";
import { TYPES } from "../../../types";
import { CreateLessonInput, UpdateLessonInput } from "@devio/zod-utils";

@injectable()
export class LessonRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(moduleId: string, data: CreateLessonInput) {
        return this.prisma.lesson.create({
            data: {
                ...data,
                module: { connect: { id: moduleId } },
            },
        });
    }

    async findById(id: string) {
        return this.prisma.lesson.findUnique({
            where: { id },
            include: { module: { include: { course: true } } },
        });
    }

    async update(id: string, data: UpdateLessonInput) {
        return this.prisma.lesson.update({
            where: { id },
            data,
        });
    }

    async updateVideoStatus(id: string, status: VideoStatus) {
        return this.prisma.lesson.update({
            where: { id },
            data: { videoStatus: status },
        });
    }

    async delete(id: string) {
        return this.prisma.lesson.delete({
            where: { id },
        });
    }

    async findManyByModuleId(moduleId: string, limit: number, cursor?: string) {
        return this.prisma.lesson.findMany({
            where: { moduleId },
            orderBy: [{ order: "asc" }, { id: "asc" }],
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
        });
    }

    async upsertLessonProgress(userId: string, lessonId: string, isCompleted: boolean) {
        return this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { isCompleted },
            create: { userId, lessonId, isCompleted },
        });
    }

    async getUserCourseProgress(userId: string, courseId: string) {
        const totalLessons = await this.prisma.lesson.count({
            where: { module: { courseId } },
        });

        const completedRecords = await this.prisma.lessonProgress.findMany({
            where: {
                userId,
                isCompleted: true,
                lesson: { module: { courseId } },
            },
            select: { lessonId: true }
        });

        const completedLessonIds = completedRecords.map(r => r.lessonId);
        const completedLessons = completedLessonIds.length;

        return {
            totalLessons,
            completedLessons,
            completedLessonIds,
            percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
    }

    private getCommentInclude(currentUserId?: string) {
        return {
            user: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                },
            },
            _count: {
                select: { replies: true }
            },
            ...(currentUserId && {
                votes: { where: { userId: currentUserId } },
            }),
        };
    }


    async createComment(
        lessonId: string,
        userId: string,
        data: { content: string; parentId?: string }
    ) {
        return this.prisma.lessonComment.create({
            data: {
                lessonId,
                userId,
                content: data.content,
                parentId: data.parentId || null,
            },
            include: this.getCommentInclude(),
        });
    }


    async findCommentById(id: string, currentUserId?: string) {
        return this.prisma.lessonComment.findUnique({
            where: { id },
            include: this.getCommentInclude(currentUserId),
        });
    }

    async findComments(
        lessonId: string,
        options: {
            cursor?: string;
            limit: number;
            sort: "best" | "newest" | "oldest";
            currentUserId?: string;
            parentId?: string | null;
        }
    ) {
        const { cursor, limit, sort, currentUserId, parentId } = options;

        let orderBy: any[];
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

        return this.prisma.lessonComment.findMany({
            where: {
                lessonId,
                parentId: parentId !== undefined ? parentId : null,
                deletedAt: null,
            },
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy,
            include: {
                ...this.getCommentInclude(currentUserId),
                replies: {
                    where: { deletedAt: null },
                    take: 3,
                    orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
                    include: this.getCommentInclude(currentUserId),
                },
            },
        });
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

        return this.prisma.lessonComment.findMany({
            where: {
                parentId,
                deletedAt: null
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

    async updateComment(id: string, content: string, currentUserId?: string) {
        return this.prisma.lessonComment.update({
            where: { id },
            data: { content },
            include: this.getCommentInclude(currentUserId),
        });
    }

    async softDelete(id: string) {
        return this.prisma.lessonComment.update({
            where: { id },
            data: {
                content: "[This comment has been deleted]",
                deletedAt: new Date(),
            },
            include: this.getCommentInclude(),
        });
    }

    async vote(commentId: string, userId: string, type: "UP" | "DOWN" | null) {
        return this.prisma.$transaction(async (tx) => {
            const existingVote = await tx.lessonCommentVote.findUnique({
                where: { lessonCommentId_userId: { lessonCommentId: commentId, userId } },
            });

            if (existingVote) {
                if (existingVote.type === type || type === null) {
                    await tx.lessonCommentVote.delete({
                        where: { id: existingVote.id },
                    });

                    return tx.lessonComment.update({
                        where: { id: commentId },
                        data: {
                            [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        },
                        include: this.getCommentInclude(userId),
                    });
                }

                await tx.lessonCommentVote.update({
                    where: { id: existingVote.id },
                    data: { type: type! },
                });

                return tx.lessonComment.update({
                    where: { id: commentId },
                    data: {
                        [existingVote.type === "UP" ? "upvotes" : "downvotes"]: { decrement: 1 },
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getCommentInclude(userId),
                });
            }

            if (type !== null) {
                await tx.lessonCommentVote.create({
                    data: { lessonCommentId: commentId, userId, type },
                });

                return tx.lessonComment.update({
                    where: { id: commentId },
                    data: {
                        [type === "UP" ? "upvotes" : "downvotes"]: { increment: 1 },
                    },
                    include: this.getCommentInclude(userId),
                });
            }

            return tx.lessonComment.findUnique({
                where: { id: commentId },
                include: this.getCommentInclude(userId),
            });
        });
    }

    async findFirstLesson(courseId: string) {
        return this.prisma.lesson.findFirst({
            where: { module: { courseId } },
            orderBy: [
                { module: { order: 'asc' } },
                { order: 'asc' },
            ],
            include: { module: { include: { course: true } } },
        });
    }

    async findNextUncompletedLesson(userId: string, courseId: string) {
        return this.prisma.lesson.findFirst({
            where: {
                module: { courseId },
                progress: {
                    none: { userId, isCompleted: true },
                },
            },
            orderBy: [
                { module: { order: 'asc' } },
                { order: 'asc' },
            ],
            include: { module: { include: { course: true } } },
        });
    }
}
