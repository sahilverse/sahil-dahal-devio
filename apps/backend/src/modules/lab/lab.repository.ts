import { injectable, inject } from "inversify";
import type { PrismaClient, CyberRoom, CyberRoomEnrollment, Prisma } from "../../generated/prisma/client";
import { VMStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class LabRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findAll(params: {
        difficulty?: string;
        isPublished?: boolean | string;
        query?: string;
        skip?: number | string;
        take?: number | string;
    }) {
        const { difficulty, isPublished, query, skip = 0, take = 10 } = params;

        const where: Prisma.CyberRoomWhereInput = {
            isPublished: typeof isPublished === "string" ? isPublished === "true" : (isPublished ?? true)
        };

        if (difficulty) where.difficulty = difficulty as any;
        if (query) {
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
            ];
        }

        const [rooms, total] = await Promise.all([
            this.prisma.cyberRoom.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            challenges: true,
                            enrollments: true
                        }
                    }
                },
                skip: Number(skip),
                take: Number(take),
                orderBy: { createdAt: "desc" }
            }),
            this.prisma.cyberRoom.count({ where })
        ]);

        return { rooms, total };
    }

    async findBySlug(slug: string): Promise<CyberRoom | null> {
        return this.prisma.cyberRoom.findUnique({
            where: { slug },
            include: {
                challenges: {
                    orderBy: { order: "asc" }
                }
            }
        });
    }

    async findById(id: string): Promise<CyberRoom | null> {
        return this.prisma.cyberRoom.findUnique({
            where: { id },
            include: {
                challenges: {
                    orderBy: { order: "asc" }
                }
            }
        });
    }

    async findEnrollment(roomId: string, userId: string): Promise<CyberRoomEnrollment | null> {
        return this.prisma.cyberRoomEnrollment.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            }
        });
    }

    async createEnrollment(roomId: string, userId: string): Promise<CyberRoomEnrollment> {
        return this.prisma.cyberRoomEnrollment.create({
            data: {
                roomId,
                userId
            }
        });
    }

    async findChallengesByRoomId(roomId: string): Promise<any[]> {
        return this.prisma.cTFChallenge.findMany({
            where: { roomId },
            orderBy: { order: "asc" }
        });
    }

    async findChallengeById(id: string): Promise<any | null> {
        return this.prisma.cTFChallenge.findUnique({
            where: { id }
        });
    }

    async findSubmission(challengeId: string, userId: string): Promise<any | null> {
        return this.prisma.cTFSubmission.findFirst({
            where: {
                challengeId,
                userId,
                isCorrect: true
            }
        });
    }

    async createSubmission(data: Prisma.CTFSubmissionCreateInput): Promise<any> {
        return this.prisma.cTFSubmission.create({ data });
    }

    async countSolvedChallenges(userId: string, roomId: string): Promise<number> {
        return this.prisma.cTFSubmission.count({
            where: {
                userId,
                challenge: { roomId },
                isCorrect: true
            }
        });
    }

    async countChallengesInRoom(roomId: string): Promise<number> {
        return this.prisma.cTFChallenge.count({
            where: { roomId }
        });
    }

    async findActiveSession(userId: string, roomId: string): Promise<any | null> {
        return this.prisma.vMSession.findFirst({
            where: {
                userId,
                roomId,
                status: VMStatus.RUNNING,
                expiresAt: {
                    gt: new Date()
                }
            }
        });
    }

    async createSession(data: Prisma.VMSessionCreateInput): Promise<any> {
        return this.prisma.vMSession.create({ data });
    }

    async updateSession(id: string, data: Prisma.VMSessionUpdateInput): Promise<any> {
        return this.prisma.vMSession.update({
            where: { id },
            data
        });
    }

    async findSessionById(id: string): Promise<any | null> {
        return this.prisma.vMSession.findUnique({
            where: { id }
        });
    }

    async findLastTerminatedSession(userId: string, roomId: string): Promise<any | null> {
        return this.prisma.vMSession.findFirst({
            where: {
                userId,
                roomId,
                status: VMStatus.TERMINATED,
                terminatedAt: { not: null }
            },
            orderBy: {
                terminatedAt: "desc"
            }
        });
    }

    async findSessionsByUserIdToday(userId: string): Promise<any[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.vMSession.findMany({
            where: {
                userId,
                startedAt: {
                    gte: today
                }
            }
        });
    }

    async findExpiredRunningSessions(): Promise<any[]> {
        return this.prisma.vMSession.findMany({
            where: {
                status: "RUNNING",
                expiresAt: {
                    lte: new Date()
                }
            }
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
        cipherReward: number;
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
                    cipherReward: data.cipherReward,
                    isPublished: data.isPublished
                },
                update: {
                    title: data.title,
                    difficulty: data.difficulty,
                    description: data.description,
                    imageId: data.imageId,
                    estimatedTime: data.estimatedTime,
                    pointsReward: data.pointsReward,
                    cipherReward: data.cipherReward,
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

    async updateEnrollment(id: string, data: Prisma.CyberRoomEnrollmentUpdateInput): Promise<any> {
        return this.prisma.cyberRoomEnrollment.update({
            where: { id },
            data
        });
    }
}
