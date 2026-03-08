import { injectable, inject } from "inversify";
import type { PrismaClient, CyberRoom, CyberRoomEnrollment, Prisma } from "../../generated/prisma/client";
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

    async updateEnrollment(id: string, data: Prisma.CyberRoomEnrollmentUpdateInput): Promise<CyberRoomEnrollment> {
        return this.prisma.cyberRoomEnrollment.update({
            where: { id },
            data
        });
    }
}
