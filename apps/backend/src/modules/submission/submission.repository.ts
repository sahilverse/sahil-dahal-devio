import { injectable, inject } from "inversify";
import { PrismaClient, SubmissionStatus, ProblemSolutionStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class SubmissionRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createSubmission(data: {
        userId: string;
        problemId: string;
        language: string;
        code: string;
        status: SubmissionStatus;
        runtime?: number;
        memory?: number;
        score: number;
        error?: string;
        eventId?: string;
    }) {
        return this.prisma.submission.create({
            data: {
                userId: data.userId,
                problemId: data.problemId,
                language: data.language,
                code: data.code,
                status: data.status,
                runtime: data.runtime,
                memory: data.memory,
                score: data.score,
                error: data.error,
                eventId: data.eventId
            }
        });
    }

    async getUserProblemStatus(userId: string, problemId: string) {
        return (this.prisma.userProblemStatus as any).findUnique({
            where: {
                userId_problemId: { userId, problemId }
            },
            select: {
                status: true,
                bestScore: true
            }
        });
    }

    async upsertUserProblemStatus(userId: string, problemId: string, score: number) {
        const isSolved = score === 100;
        const status = isSolved ? ProblemSolutionStatus.SOLVED : ProblemSolutionStatus.ATTEMPTED;

        // Using upsert to track attempts and best score
        return (this.prisma.userProblemStatus as any).upsert({
            where: {
                userId_problemId: { userId, problemId }
            },
            update: {
                status: isSolved ? ProblemSolutionStatus.SOLVED : undefined,
                attempts: { increment: 1 }
            },
            create: {
                userId,
                problemId,
                status,
                bestScore: score,
                attempts: 1
            }
        }).then(async (record: any) => {
            if (score > record.bestScore) {
                return (this.prisma.userProblemStatus as any).update({
                    where: { userId_problemId: { userId, problemId } },
                    data: { bestScore: score }
                });
            }
            return record;
        });
    }

    async updateEventScore(userId: string, eventId: string, scoreDelta: number) {
        return this.prisma.eventParticipant.update({
            where: {
                eventId_userId: { eventId, userId }
            },
            data: {
                score: { increment: scoreDelta }
            }
        });
    }

    async getBestSubmissionScore(userId: string, problemId: string, eventId?: string): Promise<number> {
        if (!eventId) return 0;

        const best = await this.prisma.submission.findFirst({
            where: {
                userId,
                problemId,
                eventId
            },
            orderBy: {
                score: 'desc'
            },
            select: {
                score: true
            }
        });

        return best?.score || 0;
    }

    async findPaginatedUserSubmissions(userId: string, problemId: string, limit: number, cursor?: string) {
        return this.prisma.submission.findMany({
            where: {
                userId,
                problemId
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                problem: {
                    select: {
                        title: true
                    }
                }
            }
        });
    }
}
