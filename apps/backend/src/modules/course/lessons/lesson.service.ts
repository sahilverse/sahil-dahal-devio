import { Request, Response, NextFunction } from 'express';
import { Readable } from "stream";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../types";
import { LessonRepository } from "./lesson.repository";
import { plainToInstance } from "class-transformer";
import { LessonContentDto, CourseProgressDto, LessonCommentResponseDto, LessonCommentListDto, LessonListDto } from "../course.dto";
import { ApiError, logger } from "../../../utils";
import { StatusCodes } from "http-status-codes";
import { CreateLessonInput, UpdateLessonInput, LessonQueryInput } from "@devio/zod-utils";
import { CourseRepository } from "../course.repository";
import { ROLES } from "../../auth/auth.types";
import { StorageService } from "../../storage";
import { VideoJobService } from "../../../queue/jobs/video";
import { MINIO_BUCKET_VIDEOS } from "../../../config/constants";
import { v4 as uuidv4 } from "uuid";
import { VideoStatus } from "../../../generated/prisma/enums";

@injectable()
export class LessonService {
    constructor(
        @inject(TYPES.LessonRepository) private lessonRepository: LessonRepository,
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.VideoJobService) private videoJobService: VideoJobService
    ) { }

    async createLesson(moduleId: string, data: CreateLessonInput) {
        const lesson = await this.lessonRepository.create(moduleId, data);
        return plainToInstance(LessonContentDto, JSON.parse(JSON.stringify(lesson)), { excludeExtraneousValues: true });
    }

    async updateLesson(lessonId: string, data: UpdateLessonInput) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);
        const updated = await this.lessonRepository.update(lessonId, data);
        return plainToInstance(LessonContentDto, JSON.parse(JSON.stringify(updated)), { excludeExtraneousValues: true });
    }

    async deleteLesson(lessonId: string) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);
        await this.lessonRepository.delete(lessonId);
    }

    async getLessonsByModuleId(moduleId: string, query: LessonQueryInput) {
        const limit = Number(query.limit) || 12;
        const lessons = await this.lessonRepository.findManyByModuleId(
            moduleId,
            limit,
            query.cursor
        );

        let nextCursor: string | null = null;
        if (lessons.length > limit) {
            const nextItem = lessons.pop();
            nextCursor = nextItem?.id || null;
        }

        return plainToInstance(LessonListDto, JSON.parse(JSON.stringify({
            items: lessons,
            nextCursor,
        })), { excludeExtraneousValues: true });
    }

    async getLessonContent(userId: string, roleName: string | null | undefined, lessonId: string): Promise<LessonContentDto> {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        const courseId = lesson.module.course.id;

        if (!lesson.isPreview && roleName !== ROLES.ADMIN) {
            const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
            if (!enrollment) {
                throw new ApiError("You must be enrolled to access this lesson", StatusCodes.FORBIDDEN);
            }
        }

        return plainToInstance(LessonContentDto, JSON.parse(JSON.stringify(lesson)), { excludeExtraneousValues: true });
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

        return plainToInstance(CourseProgressDto, JSON.parse(JSON.stringify(progress)), { excludeExtraneousValues: true });
    }

    async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressDto> {
        const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
        if (!enrollment) throw new ApiError("You must be enrolled to view progress", StatusCodes.FORBIDDEN);

        const progress = await this.lessonRepository.getUserCourseProgress(userId, courseId);
        return plainToInstance(CourseProgressDto, JSON.parse(JSON.stringify(progress)), { excludeExtraneousValues: true });
    }

    async uploadLessonVideo(lessonId: string, file: Express.Multer.File) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        // Upload raw video to MinIO under temp/ prefix
        const ext = file.originalname.split(".").pop() || "mp4";
        const rawVideoKey = `temp/${lessonId}/${uuidv4()}.${ext}`;

        await this.storageService.uploadBuffer(
            file.buffer,
            rawVideoKey,
            file.mimetype,
            MINIO_BUCKET_VIDEOS,
            false // isPublic: false
        );

        // Update lesson status to PROCESSING
        await this.lessonRepository.updateVideoStatus(lessonId, VideoStatus.PROCESSING);

        // Add transcoding job to queue
        await this.videoJobService.addTranscodeJob(lessonId, rawVideoKey);

        return { lessonId, status: VideoStatus.PROCESSING, rawVideoKey };
    }

    async getLessonVideoStreaming(userId: string, roleName: string | null | undefined, lessonId: string, filePath: string) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        const courseId = lesson.module.course.id;

        // Check if user is enrolled or if lesson is a preview
        const isEnrolled = await this.courseRepository.isUserEnrolled(userId, courseId);
        if (!isEnrolled && !lesson.isPreview && roleName !== ROLES.ADMIN) {
            throw new ApiError("You are not enrolled in this course", StatusCodes.FORBIDDEN);
        }

        if (lesson.videoStatus !== VideoStatus.READY) {
            throw new ApiError("Video is not ready yet", StatusCodes.BAD_REQUEST);
        }

        const fullPath = `courses/${lessonId}/${filePath}`;
        return this.storageService.getObjectStream(fullPath, MINIO_BUCKET_VIDEOS);
    }

    // ─── Lesson Comments ──────────────────────────────────

    async createComment(
        userId: string,
        roleName: string | null | undefined,
        lessonId: string,
        data: { content: string; parentId?: string }
    ) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        if (roleName !== ROLES.ADMIN) {
            const courseId = lesson.module.course.id;
            const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
            if (!enrollment) {
                throw new ApiError("You must be enrolled to comment on this lesson", StatusCodes.FORBIDDEN);
            }
        }

        if (data.parentId) {
            const parent = await this.lessonRepository.findCommentById(data.parentId);
            if (!parent) throw new ApiError("Parent comment not found", StatusCodes.NOT_FOUND);
            if (parent.lessonId !== lessonId) throw new ApiError("Parent comment belongs to a different lesson", StatusCodes.BAD_REQUEST);
        }

        const comment = await this.lessonRepository.createComment(lessonId, userId, data);
        return plainToInstance(LessonCommentResponseDto, JSON.parse(JSON.stringify(comment)), { excludeExtraneousValues: true });
    }


    async getComments(
        userId: string | undefined,
        roleName: string | null | undefined,
        lessonId: string,
        query: { limit: number; cursor?: string; sort: "best" | "newest" | "oldest" }
    ) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        // Enforcement: Lesson discussion is for enrolled students only (unless it's a preview lesson)
        if (!lesson.isPreview && roleName !== ROLES.ADMIN) {
            if (!userId) throw new ApiError("Authentication required", StatusCodes.UNAUTHORIZED);
            const courseId = lesson.module.course.id;
            const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
            if (!enrollment) throw new ApiError("You must be enrolled to view comments", StatusCodes.FORBIDDEN);
        }

        const comments = await this.lessonRepository.findComments(lessonId, {
            limit: query.limit,
            cursor: query.cursor,
            sort: query.sort,
            currentUserId: userId,
            parentId: null, // Initial fetch is top-level only
        });

        let nextCursor: string | null = null;
        if (comments.length > query.limit) {
            const nextItem = comments.pop();
            nextCursor = nextItem?.id || null;
        }

        return plainToInstance(LessonCommentListDto, JSON.parse(JSON.stringify({
            items: comments,
            nextCursor,
        })), { excludeExtraneousValues: true });
    }

    async getReplies(
        userId: string | undefined,
        roleName: string | null | undefined,
        lessonId: string,
        commentId: string,
        query: { limit: number; cursor?: string }
    ) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new ApiError("Lesson not found", StatusCodes.NOT_FOUND);

        const comments = await this.lessonRepository.findReplies(commentId, {
            limit: query.limit,
            cursor: query.cursor,
            currentUserId: userId,
        });

        let nextCursor: string | null = null;
        if (comments.length > query.limit) {
            const nextItem = comments.pop();
            nextCursor = nextItem?.id || null;
        }

        return plainToInstance(LessonCommentListDto, JSON.parse(JSON.stringify({
            items: comments,
            nextCursor,
        })), { excludeExtraneousValues: true });
    }

    async updateComment(userId: string, commentId: string, content: string) {
        const comment = await this.lessonRepository.findCommentById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);
        if (comment.userId !== userId) throw new ApiError("Unauthorized", StatusCodes.FORBIDDEN);

        const updated = await this.lessonRepository.updateComment(commentId, content, userId);
        return plainToInstance(LessonCommentResponseDto, JSON.parse(JSON.stringify(updated)), { excludeExtraneousValues: true });
    }

    async deleteComment(userId: string, roleName: string | null | undefined, commentId: string) {
        const comment = await this.lessonRepository.findCommentById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);

        if (comment.userId !== userId && roleName !== ROLES.ADMIN) {
            throw new ApiError("Unauthorized", StatusCodes.FORBIDDEN);
        }

        const deleted = await this.lessonRepository.softDelete(commentId);
        return plainToInstance(LessonCommentResponseDto, JSON.parse(JSON.stringify(deleted)), { excludeExtraneousValues: true });
    }

    async voteComment(userId: string, commentId: string, type: "UP" | "DOWN" | null) {
        const comment = await this.lessonRepository.findCommentById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);

        const updatedComment = await this.lessonRepository.vote(commentId, userId, type);
        return plainToInstance(LessonCommentResponseDto, JSON.parse(JSON.stringify(updatedComment)), { excludeExtraneousValues: true });
    }
}
