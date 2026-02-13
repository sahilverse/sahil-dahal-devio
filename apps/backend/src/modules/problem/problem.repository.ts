import { injectable, inject } from "inversify";
import { PrismaClient, Problem, Prisma, Difficulty, ProblemSolutionStatus } from "../../generated/prisma/client";
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
        hasBounty?: boolean;
        userId?: string;
    }) {
        const { cursor, search, difficulties, topicSlugs, status, hasBounty, userId } = params;
        const limit = params.limit ? parseInt(params.limit.toString(), 10) : 10;

        const conditions: Prisma.ProblemWhereInput[] = [
            { isPublished: true }
        ];

        if (search) {
            conditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        if (difficulties) {
            const diffs = Array.isArray(difficulties) ? difficulties : [difficulties];
            // Filter out any undefined/invalid values
            const validDiffs = diffs.filter(d => Boolean(d)) as Difficulty[];
            if (validDiffs.length > 0) {
                conditions.push({
                    difficulty: { in: validDiffs }
                });
            }
        }

        if (topicSlugs && topicSlugs.length > 0) {
            conditions.push({
                topics: {
                    some: {
                        topic: {
                            slug: { in: topicSlugs }
                        }
                    }
                }
            });
        }

        if (hasBounty) {
            conditions.push({
                cipherReward: { gt: 0 }
            });
        }

        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            if (statusArray.length > 0) {
                const statusFilters: Prisma.ProblemWhereInput[] = [];

                if (statusArray.includes(ProblemSolutionStatus.UNSOLVED)) {
                    if (userId) {
                        statusFilters.push({
                            userStatuses: {
                                none: { userId }
                            }
                        });
                    } else {
                        statusFilters.push({ isPublished: true });
                    }
                }

                if (statusArray.includes(ProblemSolutionStatus.ATTEMPTED)) {
                    if (userId) {
                        statusFilters.push({
                            userStatuses: {
                                some: { userId, status: ProblemSolutionStatus.ATTEMPTED }
                            }
                        });
                    }
                }

                if (statusArray.includes(ProblemSolutionStatus.SOLVED)) {
                    if (userId) {
                        statusFilters.push({
                            userStatuses: {
                                some: { userId, status: ProblemSolutionStatus.SOLVED }
                            }
                        });
                    }
                }

                if (statusFilters.length > 0) {
                    conditions.push({ OR: statusFilters });
                } else if (statusArray.length > 0) {
                    conditions.push({ id: "none" });
                }
            }
        }

        return this.prisma.problem.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            where: {
                AND: conditions
            },
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
        inputStructure?: any;
    }) {
        const { slug, title, difficulty, description, storagePath, isPublished, cipherReward, topicIds, testCases, inputStructure } = params;

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
                    },
                    inputStructure
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
                    },
                    inputStructure
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
