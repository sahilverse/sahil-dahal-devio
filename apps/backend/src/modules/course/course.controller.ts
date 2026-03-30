import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CourseService } from "./course.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class CourseController {
    constructor(@inject(TYPES.CourseService) private courseService: CourseService) { }

    // ─── Course CRUD (Admin) ──────────────────────────────

    createCourse = asyncHandler(async (req: Request, res: Response) => {
        const authorId = req.user!.id;
        const result = await this.courseService.createCourse(authorId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Course created successfully", result);
    });

    updateCourse = asyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params as { courseId: string };
        const result = await this.courseService.updateCourse(courseId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Course updated successfully", result);
    });

    deleteCourse = asyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params as { courseId: string };
        await this.courseService.deleteCourse(courseId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Course deleted successfully");
    });

    // ─── Course Queries ───────────────────────────────────

    getCourses = asyncHandler(async (req: Request, res: Response) => {
        const currentUserId = req.user?.id;
        const result = await this.courseService.getCourses(req.query as any, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Courses fetched successfully", result);
    });

    getCourseBySlug = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params as { slug: string };
        const currentUserId = req.user?.id;
        const result = await this.courseService.getCourseBySlug(slug, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Course fetched successfully", result);
    });

    getMyEnrollments = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { cursor, limit } = req.query as any;
        const result = await this.courseService.getMyEnrollments(userId, {
            cursor,
            limit
        });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Enrolled courses fetched successfully", result);
    });

    // ─── Enrollment ───────────────────────────────────────

    enrollInCourse = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { courseId } = req.params as { courseId: string };
        const { useCipherCoins, cipherAmount } = req.body;

        const result = await this.courseService.enrollInCourse(userId, courseId, {
            useCipherCoins,
            cipherAmount,
        });

        if (result.requiresPayment) {
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Payment required for enrollment", result);
        } else {
            ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Enrolled successfully", result);
        }
    });

    // ─── Reviews ──────────────────────────────────────────

    createReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { courseId } = req.params as { courseId: string };
        const result = await this.courseService.createReview(userId, courseId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Review submitted successfully", result);
    });

    updateReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { reviewId } = req.params as { reviewId: string };
        const result = await this.courseService.updateReview(userId, reviewId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Review updated successfully", result);
    });

    deleteReview = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { reviewId } = req.params as { reviewId: string };
        await this.courseService.deleteReview(userId, reviewId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Review deleted successfully");
    });

    getReviews = asyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params as { courseId: string };
        const limit = Number(req.query.limit) || 10;
        const cursor = req.query.cursor as string;
        const result = await this.courseService.getReviews(courseId, limit, cursor);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Reviews fetched successfully", result);
    });
}
