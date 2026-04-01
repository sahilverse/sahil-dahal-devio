import { injectable, inject } from "inversify";
import { PrismaClient } from "../../../generated/prisma/client";
import { TYPES } from "../../../types";

@injectable()
export class ModuleRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(courseId: string, title: string, order: number) {
        return this.prisma.courseModule.create({
            data: {
                title,
                order,
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
