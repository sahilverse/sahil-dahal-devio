import { injectable, inject } from "inversify";
import { TYPES } from "../../../types";
import { LessonRepository } from "./lesson.repository";
import { ApiError } from "../../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateLessonInput, UpdateLessonInput, LessonQueryInput } from "@devio/zod-utils";
import { plainToInstance } from "class-transformer";
import { LessonContentDto, CourseProgressDto, LessonSummaryDto } from "../course.dto";
import { CourseRepository } from "../course.repository";

@injectable()
export class LessonService {
    constructor(
        @inject(TYPES.LessonRepository) private lessonRepository: LessonRepository,
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository
    ) { }

    async createLesson(moduleId: string, data: CreateLessonInput) {
        return this.lessonRepository.create(moduleId, data);
    }

    async updateLesson(lessonId: string, data: UpdateLessonInput) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);
        return this.lessonRepository.update(lessonId, data);
    }

    async deleteLesson(lessonId: string) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);
        await this.lessonRepository.delete(lessonId);
    }

    async getLessonsByModuleId(moduleId: string, query: LessonQueryInput) {
        const lessons = await this.lessonRepository.findManyByModuleId(
            moduleId,
            query.limit,
            query.cursor
        );

        let nextCursor: string | null = null;
        if (lessons.length > query.limit) {
            const nextItem = lessons.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            items: plainToInstance(LessonSummaryDto, lessons, { excludeExtraneousValues: true }),
            nextCursor,
        };
    }

    async getLessonContent(userId: string, lessonId: string): Promise<LessonContentDto> {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        const courseId = lesson.module.course.id;

        if (!lesson.isPreview) {
            const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
            if (!enrollment) {
                throw new ApiError("You must be enrolled to access this lesson", StatusCodes.FORBIDDEN);
            }
        }

        return plainToInstance(LessonContentDto, lesson, { excludeExtraneousValues: true });
    }

    async updateLessonProgress(userId: string, lessonId: string, isCompleted: boolean) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        const courseId = lesson.module.course.id;
        const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
        if (!enrollment) throw new ApiError("You must be enrolled to track progress", StatusCodes.FORBIDDEN);

        await this.lessonRepository.upsertLessonProgress(userId, lessonId, isCompleted);

        // Recalculate and update enrollment progress
        const progress = await this.lessonRepository.getUserCourseProgress(userId, courseId);
        if (progress) {
            await this.courseRepository.updateEnrollment(userId, courseId, {
                progress: progress.percentage,
            });
        }

        return plainToInstance(CourseProgressDto, progress, { excludeExtraneousValues: true });
    }

    async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressDto> {
        const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
        if (!enrollment) throw new ApiError("You must be enrolled to view progress", StatusCodes.FORBIDDEN);

        const progress = await this.lessonRepository.getUserCourseProgress(userId, courseId);
        return plainToInstance(CourseProgressDto, progress, { excludeExtraneousValues: true });
    }
}
