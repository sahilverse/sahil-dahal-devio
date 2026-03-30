import { injectable, inject } from "inversify";
import { PrismaClient } from "../../../generated/prisma/client";
import { TYPES } from "../../../types";
import { CreateLessonInput, UpdateLessonInput } from "@devio/zod-utils";

@injectable()
export class LessonRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(moduleId: string, data: CreateLessonInput) {
        return this.prisma.lesson.create({
            data: {
                ...data,
                module: { connect: { id: moduleId } },
            },
        });
    }

    async findById(id: string) {
        return this.prisma.lesson.findUnique({
            where: { id },
            include: { module: { include: { course: true } } },
        });
    }

    async update(id: string, data: UpdateLessonInput) {
        return this.prisma.lesson.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.lesson.delete({
            where: { id },
        });
    }

    async findManyByModuleId(moduleId: string, limit: number, cursor?: string) {
        return this.prisma.lesson.findMany({
            where: { moduleId },
            orderBy: [{ order: "asc" }, { id: "asc" }],
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
        });
    }

    async upsertLessonProgress(userId: string, lessonId: string, isCompleted: boolean) {
        return this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { isCompleted },
            create: { userId, lessonId, isCompleted },
        });
    }

    async getUserCourseProgress(userId: string, courseId: string) {
        const totalLessons = await this.prisma.lesson.count({
            where: { module: { courseId } },
        });

        const completedLessons = await this.prisma.lessonProgress.count({
            where: {
                userId,
                isCompleted: true,
                lesson: { module: { courseId } },
            },
        });

        return {
            totalLessons,
            completedLessons,
            percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
    }
}
