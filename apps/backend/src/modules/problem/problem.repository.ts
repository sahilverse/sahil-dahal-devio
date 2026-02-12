import { injectable, inject } from "inversify";
import { PrismaClient, Problem, Prisma, Difficulty } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class ProblemRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    private getProblemInclude() {
        return {
            topics: {
                include: {
                    topic: true
                }
            },
            testCases: true
        };
    }

    async findMany(params: {
        cursor?: string;
        limit?: number | string;
        search?: string;
        difficulties?: Difficulty[];
        topicSlugs?: string[];
        status?: string[];
        userId?: string;
    }) {
        const { cursor, search, difficulties, topicSlugs, status, userId } = params;
        const limit = params.limit ? parseInt(params.limit.toString(), 10) : 10;

        const where: Prisma.ProblemWhereInput = {
            isPublished: true,
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (difficulties && difficulties.length > 0) {
            where.difficulty = { in: difficulties };
        }

        if (topicSlugs && topicSlugs.length > 0) {
            where.topics = {
                some: {
                    topic: {
                        slug: { in: topicSlugs }
                    }
                }
            };
        }

        if (userId && status && status.length > 0) {
            const statusFilters: Prisma.ProblemWhereInput[] = [];

            if (status.includes("TODO")) {
                statusFilters.push({
                    userStatuses: {
                        none: { userId }
                    }
                });
            }

            if (status.includes("ATTEMPTED")) {
                statusFilters.push({
                    userStatuses: {
                        some: { userId, status: "ATTEMPTED" }
                    }
                });
            }

            if (status.includes("SOLVED")) {
                statusFilters.push({
                    userStatuses: {
                        some: { userId, status: "SOLVED" }
                    }
                });
            }

            if (statusFilters.length > 0) {
                where.AND = [
                    ...(where.AND as Prisma.ProblemWhereInput[] || []),
                    { OR: statusFilters }
                ];
            }
        }

        return this.prisma.problem.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            where,
            orderBy: { createdAt: "desc" },
            include: {
                topics: {
                    include: {
                        topic: true
                    }
                },
                userStatuses: userId ? {
                    where: { userId }
                } : false
            }
        });
    }

    async findBySlug(slug: string): Promise<Problem | null> {
        return this.prisma.problem.findUnique({
            where: { slug },
            include: this.getProblemInclude()
        });
    }

    async findById(id: string): Promise<Problem | null> {
        return this.prisma.problem.findUnique({
            where: { id },
            include: this.getProblemInclude()
        });
    }

    async syncProblemWithRelations(params: {
        slug: string;
        title: string;
        difficulty: Difficulty;
        description: string;
        storagePath: string;
        isPublished: boolean;
        cipherReward: number;
        topicIds: string[];
        testCases: any[];
    }) {
        const { slug, title, difficulty, description, storagePath, isPublished, cipherReward, topicIds, testCases } = params;

        return this.prisma.$transaction(async (tx) => {
            const problem = await tx.problem.upsert({
                where: { slug },
                create: {
                    title,
                    slug,
                    difficulty,
                    description,
                    storagePath,
                    isPublished,
                    cipherReward,
                    topics: {
                        create: topicIds.map(id => ({
                            topic: { connect: { id } }
                        }))
                    },
                    testCases: {
                        create: testCases
                    }
                },
                update: {
                    title,
                    difficulty,
                    description,
                    storagePath,
                    isPublished,
                    cipherReward,
                    topics: {
                        deleteMany: {},
                        create: topicIds.map(id => ({
                            topic: { connect: { id } }
                        }))
                    },
                    testCases: {
                        deleteMany: {},
                        create: testCases
                    }
                },
                include: {
                    testCases: {
                        where: { isPublic: true },
                        orderBy: { order: "asc" },
                        take: 3
                    }
                }
            });
            return problem;
        });
    }

    async getSampleTestCases(problemId: string, limit: number = 3) {
        return this.prisma.testCase.findMany({
            where: { problemId, isPublic: true },
            orderBy: { order: "asc" },
            take: limit
        });
    }

    get client() {
        return this.prisma;
    }
}
