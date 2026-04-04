import { injectable, inject } from "inversify";
import { PrismaClient } from "../../../generated/prisma/client";
import { TYPES } from "../../../types";

@injectable()
export class ModuleRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(courseId: string, title: string, order?: number) {
        let finalOrder = order || 0;

        // 1. If order is provided and already exists, shift existing ones up
        if (finalOrder > 0) {
            const existing = await this.prisma.courseModule.findFirst({
                where: { courseId, order: finalOrder },
            });

            if (existing) {
                await this.prisma.courseModule.updateMany({
                    where: { courseId, order: { gte: finalOrder } },
                    data: { order: { increment: 1 } },
                });
            }
        } else {
            // 2. If no order, find max and increment
            const aggregate = await this.prisma.courseModule.aggregate({
                where: { courseId },
                _max: { order: true },
            });
            finalOrder = (aggregate._max.order || 0) + 1;
        }

        return this.prisma.courseModule.create({
            data: {
                title,
                order: finalOrder,
                course: { connect: { id: courseId } },
            },
        });
    }

    async findById(id: string) {
        return this.prisma.courseModule.findUnique({
            where: { id },
            include: { course: true, lessons: true },
        });
    }

    async update(id: string, data: { title?: string; order?: number }) {
        return this.prisma.courseModule.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.courseModule.delete({
            where: { id },
        });
    }

    async findManyByCourseId(courseId: string, limit: number, cursor?: string) {
        return this.prisma.courseModule.findMany({
            where: { courseId },
            orderBy: [{ order: "asc" }, { id: "asc" }],
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            include: {
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                        order: true,
                        isPreview: true,
                        videoUrl: true,
                        videoStatus: true,
                    },
                    orderBy: [{ order: "asc" }, { id: "asc" }],
                },
                _count: {
                    select: { lessons: true },
                },
            },
        });
    }
}
