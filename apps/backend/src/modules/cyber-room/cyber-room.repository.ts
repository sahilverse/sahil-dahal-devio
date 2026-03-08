import { injectable, inject } from "inversify";
import type { PrismaClient, CTFChallenge, CTFSubmission, VMSession, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CyberRoomRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findRoomById(id: string): Promise<any | null> {
        return this.prisma.cyberRoom.findUnique({
            where: { id }
        });
    }

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

    async syncRoomWithRelations(data: {
        slug: string;
        title: string;
        difficulty: any;
        description: string;
        imageId: string;
        estimatedTime: number | null;
        pointsReward: number;
        isPublished: boolean;
        challenges: Array<{
            title: string;
            description: string;
            type: any;
            flag: string;
            points: number;
            hints: string[];
            order: number;
        }>;
    }) {
        return this.prisma.$transaction(async (tx) => {
            const room = await tx.cyberRoom.upsert({
                where: { slug: data.slug },
                create: {
                    slug: data.slug,
                    title: data.title,
                    difficulty: data.difficulty,
                    description: data.description,
                    imageId: data.imageId,
                    estimatedTime: data.estimatedTime,
                    pointsReward: data.pointsReward,
                    isPublished: data.isPublished
                },
                update: {
                    title: data.title,
                    difficulty: data.difficulty,
                    description: data.description,
                    imageId: data.imageId,
                    estimatedTime: data.estimatedTime,
                    pointsReward: data.pointsReward,
                    isPublished: data.isPublished
                }
            });

            // Delete existing challenges to avoid orphans
            await tx.cTFChallenge.deleteMany({
                where: { roomId: room.id }
            });

            if (data.challenges.length > 0) {
                await tx.cTFChallenge.createMany({
                    data: data.challenges.map(c => ({
                        roomId: room.id,
                        title: c.title,
                        description: c.description,
                        type: c.type,
                        flag: c.flag,
                        points: c.points,
                        hints: c.hints,
                        order: c.order
                    }))
                });
            }

            return room;
        });
    }
}
