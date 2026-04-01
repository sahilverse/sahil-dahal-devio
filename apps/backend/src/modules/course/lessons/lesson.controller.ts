import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { LessonService } from "./lesson.service";
import { asyncHandler, ResponseHandler } from "../../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class LessonController {
    constructor(@inject(TYPES.LessonService) private lessonService: LessonService) { }

    createLesson = asyncHandler(async (req: Request, res: Response) => {
        const { moduleId } = req.params as { moduleId: string };
        const result = await this.lessonService.createLesson(moduleId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Lesson created successfully", result);
    });

    updateLesson = asyncHandler(async (req: Request, res: Response) => {
        const { lessonId } = req.params as { lessonId: string };
        const result = await this.lessonService.updateLesson(lessonId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Lesson updated successfully", result);
    });

    deleteLesson = asyncHandler(async (req: Request, res: Response) => {
        const { lessonId } = req.params as { lessonId: string };
        await this.lessonService.deleteLesson(lessonId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Lesson deleted successfully");
    });

    uploadVideo = asyncHandler(async (req: Request, res: Response) => {
        const { lessonId } = req.params as { lessonId: string };
        const file = req.file;

        if (!file) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "No video file provided");
        }

        const result = await this.lessonService.uploadLessonVideo(lessonId, file);
        ResponseHandler.sendResponse(res, StatusCodes.ACCEPTED, "Video upload started", result);
    });

    streamVideo = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const roleName = req.user?.role;
        const { lessonId } = req.params as { lessonId: string };


        let filePath = (req.params as any).path || "master.m3u8";
        if (Array.isArray(filePath)) {
            filePath = filePath.join("/");
        }

        const { stream, contentType, contentLength } = await this.lessonService.getLessonVideoStreaming(
            userId,
            roleName,
            lessonId,
            filePath
        );

        if (contentType) res.setHeader("Content-Type", contentType);
        if (contentLength) res.setHeader("Content-Length", contentLength);

        stream.pipe(res);
    });

    getLessons = asyncHandler(async (req: Request, res: Response) => {
        const { moduleId } = req.params as { moduleId: string };
        const query = req.query as any;
        const result = await this.lessonService.getLessonsByModuleId(moduleId, query);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Lessons fetched successfully", result);
    });

    getLessonContent = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const roleName = req.user?.role;
        const { lessonId } = req.params as { lessonId: string };
        const result = await this.lessonService.getLessonContent(userId, roleName, lessonId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Lesson content fetched successfully", result);
    });

    updateProgress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { lessonId } = req.params as { lessonId: string };
        const { isCompleted } = req.body;
        const result = await this.lessonService.updateLessonProgress(userId, lessonId, isCompleted);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Progress updated successfully", result);
    });

    getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { courseId } = req.params as { courseId: string };
        const result = await this.lessonService.getCourseProgress(userId, courseId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Progress fetched successfully", result);
    });

    createComment = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const roleName = req.user!.role;
        const { lessonId } = req.params as { lessonId: string };
        const result = await this.lessonService.createComment(userId, roleName, lessonId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Comment posted successfully", result);
    });


    getComments = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const roleName = req.user?.role;
        const { lessonId } = req.params as { lessonId: string };
        const { cursor, limit, sort } = req.query as any;

        const result = await this.lessonService.getComments(userId, roleName, lessonId, {
            cursor,
            limit: Number(limit) || 10,
            sort: (sort as any) || "best"
        });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comments fetched successfully", result);
    });

    getReplies = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const roleName = req.user?.role;
        const { lessonId, commentId } = req.params as { lessonId: string; commentId: string };
        const { cursor, limit } = req.query as any;

        const result = await this.lessonService.getReplies(userId, roleName, lessonId, commentId, {
            cursor,
            limit: Number(limit) || 10
        });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Replies fetched successfully", result);
    });

    updateComment = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { commentId } = req.params as { commentId: string };
        const { content } = req.body;
        const result = await this.lessonService.updateComment(userId, commentId, content);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comment updated successfully", result);
    });

    deleteComment = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const roleName = req.user!.role;
        const { commentId } = req.params as { commentId: string };
        const result = await this.lessonService.deleteComment(userId, roleName, commentId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comment deleted successfully", result);
    });

    voteComment = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { commentId } = req.params as { commentId: string };
        const { type } = req.body;
        const result = await this.lessonService.voteComment(userId, commentId, type);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Vote recorded successfully", result);
    });
}
