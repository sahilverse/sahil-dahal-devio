import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CourseRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: Prisma.CourseCreateInput) {
        return this.prisma.course.create({
            data,
            include: this.courseInclude(),
        });
    }

    async findBySlug(slug: string, currentUserId?: string) {
        return this.prisma.course.findUnique({
            where: { slug },
            include: {
                ...this.courseInclude(),
                modules: {
                    orderBy: { order: "asc" },
                    include: {
                        lessons: {
                            orderBy: { order: "asc" },
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                order: true,
                                isPreview: true,
                            },
                        },
                    },
                },
                reviews: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true,
                    },
                },
                ...(currentUserId ? {
                    enrollments: {
                        where: { userId: currentUserId },
                        take: 1,
                    },
                } : {}),
            },
        });
    }

    async findById(id: string) {
        return this.prisma.course.findUnique({
            where: { id },
            include: this.courseInclude(),
        });
    }

    async findMany(params: {
        cursor?: string;
        limit: number;
        topicSlug?: string;
        isFree?: boolean;
        search?: string;
        sortBy?: string;
        isPublished?: boolean;
    }) {
        const { cursor, limit, topicSlug, isFree, search, sortBy, isPublished } = params;

        const where: Prisma.CourseWhereInput = {
            ...(isPublished !== undefined && { isPublished }),
            ...(isFree !== undefined && { isFree }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" as const } },
                    { description: { contains: search, mode: "insensitive" as const } },
                ],
            }),
            ...(topicSlug && {
                courseTopics: {
                    some: {
                        topic: { slug: topicSlug },
                    },
                },
            }),
        };

        let orderBy: Prisma.CourseOrderByWithRelationInput[] = [{ createdAt: "desc" }, { id: "desc" }];
        if (sortBy === "POPULAR") orderBy = [{ enrollments: { _count: "desc" } }, { id: "desc" }];
        if (sortBy === "PRICE_LOW") orderBy = [{ price: "asc" }, { id: "asc" }];
        if (sortBy === "PRICE_HIGH") orderBy = [{ price: "desc" }, { id: "desc" }];

        return this.prisma.course.findMany({
            where,
            orderBy,
            take: (Number(limit) || 10) + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            include: {
                ...this.courseInclude(),
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: Prisma.CourseUpdateInput) {
        return this.prisma.course.update({
            where: { id },
            data,
            include: this.courseInclude(),
        });
    }

    async delete(id: string) {
        return this.prisma.course.delete({ where: { id } });
    }

    // ─── Enrollment ────────────────────────────────────────

    async findEnrollment(userId: string, courseId: string) {
        return this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
    }

    async createEnrollment(userId: string, courseId: string) {
        return this.prisma.enrollment.create({
            data: { userId, courseId },
        });
    }

    async updateEnrollment(userId: string, courseId: string, data: Prisma.EnrollmentUpdateInput) {
        return this.prisma.enrollment.update({
            where: { userId_courseId: { userId, courseId } },
            data,
        });
    }

    async findEnrollmentsByUser(userId: string, limit: number, cursor?: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            take: (Number(limit) || 12) + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            include: {
                course: {
                    include: {
                        author: {
                            select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
                        },
                        _count: {
                            select: {
                                enrollments: true,
                                reviews: true,
                            },
                        },
                    },
                },
            },
            orderBy: { enrolledAt: "desc" },
        });

        return enrollments;
    }

    // ─── Reviews ───────────────────────────────────────────

    async createReview(courseId: string, userId: string, rating: number, comment?: string) {
        return this.prisma.courseReview.create({
            data: { courseId, userId, rating, comment },
            include: {
                user: {
                    select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
                },
            },
        });
    }

    async findReview(courseId: string, userId: string) {
        return this.prisma.courseReview.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
    }

    async findReviewById(id: string) {
        return this.prisma.courseReview.findUnique({
            where: { id },
        });
    }

    async updateReview(id: string, data: { rating?: number; comment?: string }) {
        return this.prisma.courseReview.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
                },
            },
        });
    }

    async deleteReview(id: string) {
        return this.prisma.courseReview.delete({ where: { id } });
    }

    async findReviews(courseId: string, limit: number, cursor?: string) {
        return this.prisma.courseReview.findMany({
            where: { courseId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            include: {
                user: {
                    select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
                },
            },
        });
    }

    async getAverageRating(courseId: string) {
        const result = await this.prisma.courseReview.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        return {
            average: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : 0,
            count: result._count.rating,
        };
    }

    // ─── Course Topic Sync ─────────────────────────────────

    async syncTopics(courseId: string, topicIds: string[], tx?: Prisma.TransactionClient) {
        const client = tx || this.prisma;

        await client.courseTopic.deleteMany({ where: { courseId } });

        if (topicIds.length > 0) {
            await client.courseTopic.createMany({
                data: topicIds.map(topicId => ({ courseId, topicId })),
            });
        }
    }

    // ─── Helpers ───────────────────────────────────────────

    private courseInclude() {
        return {
            author: {
                select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true },
            },
            courseTopics: {
                include: {
                    topic: { select: { id: true, name: true, slug: true } },
                },
            },
        };
    }

    get client() {
        return this.prisma;
    }
}
