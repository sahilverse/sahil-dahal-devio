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

    getLessons = asyncHandler(async (req: Request, res: Response) => {
        const { moduleId } = req.params as { moduleId: string };
        const query = req.query as any;
        const result = await this.lessonService.getLessonsByModuleId(moduleId, query);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Lessons fetched successfully", result);
    });

    getLessonContent = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { lessonId } = req.params as { lessonId: string };
        const result = await this.lessonService.getLessonContent(userId, lessonId);
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
        const roleId = req.user!.roleId;
        const { lessonId } = req.params as { lessonId: string };
        const result = await this.lessonService.createComment(userId, roleId, lessonId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Comment posted successfully", result);
    });

    getComments = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const roleId = req.user?.roleId;
        const { lessonId } = req.params as { lessonId: string };
        const query = req.query as any;

        const result = await this.lessonService.getComments(userId, roleId, lessonId, query);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comments fetched successfully", result);
    });
}
