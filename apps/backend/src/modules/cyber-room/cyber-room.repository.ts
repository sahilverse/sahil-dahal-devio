import { injectable, inject } from "inversify";
import type { PrismaClient, CTFChallenge, CTFSubmission, VMSession, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CyberRoomRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findChallengesByRoomId(roomId: string): Promise<CTFChallenge[]> {
        return this.prisma.cTFChallenge.findMany({
            where: { roomId },
            orderBy: { order: "asc" }
        });
    }

    async findChallengeById(id: string): Promise<CTFChallenge | null> {
        return this.prisma.cTFChallenge.findUnique({
            where: { id }
        });
    }

    async findSubmission(challengeId: string, userId: string): Promise<CTFSubmission | null> {
        return this.prisma.cTFSubmission.findFirst({
            where: {
                challengeId,
                userId,
                isCorrect: true
            }
        });
    }

    async createSubmission(data: Prisma.CTFSubmissionCreateInput): Promise<CTFSubmission> {
        return this.prisma.cTFSubmission.create({ data });
    }

    async findActiveSession(userId: string, roomId: string): Promise<VMSession | null> {
        return this.prisma.vMSession.findFirst({
            where: {
                userId,
                roomId,
                status: "RUNNING",
                expiresAt: {
                    gt: new Date()
                }
            }
        });
    }

    async createSession(data: Prisma.VMSessionCreateInput): Promise<VMSession> {
        return this.prisma.vMSession.create({ data });
    }

    async updateSession(id: string, data: Prisma.VMSessionUpdateInput): Promise<VMSession> {
        return this.prisma.vMSession.update({
            where: { id },
            data
        });
    }

    async findSessionById(id: string): Promise<VMSession | null> {
        return this.prisma.vMSession.findUnique({
            where: { id }
        });
    }
}
