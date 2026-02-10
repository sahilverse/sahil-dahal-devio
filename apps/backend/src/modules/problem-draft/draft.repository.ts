import { injectable, inject } from "inversify";
import { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class ProblemDraftRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async upsertDraft(userId: string, problemId: string, language: string, code: string) {
        return this.prisma.userProblemDraft.upsert({
            where: {
                userId_problemId_language: {
                    userId,
                    problemId,
                    language
                }
            },
            create: {
                userId,
                problemId,
                language,
                code
            },
            update: {
                code
            }
        });
    }

    async findDraft(userId: string, problemId: string, language: string) {
        return this.prisma.userProblemDraft.findUnique({
            where: {
                userId_problemId_language: {
                    userId,
                    problemId,
                    language
                }
            }
        });
    }

    async findAllDraftsForProblem(userId: string, problemId: string) {
        return this.prisma.userProblemDraft.findMany({
            where: { userId, problemId }
        });
    }
}
