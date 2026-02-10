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
        limit?: number;
    }) {
        const { cursor, limit = 10 } = params;
        return this.prisma.problem.findMany({
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: "desc" },
            include: this.getProblemInclude()
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
        topicIds: string[];
        testCases: any[];
    }) {
        const { slug, title, difficulty, description, storagePath, isPublished, topicIds, testCases } = params;

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
