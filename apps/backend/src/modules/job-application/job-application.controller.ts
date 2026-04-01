import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { JobApplicationService } from "./job-application.service";

@injectable()
export class JobApplicationController {
    constructor(
        @inject(TYPES.JobApplicationService) private jobApplicationService: JobApplicationService
    ) { }

    applyForJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const result = await this.jobApplicationService.applyForJob(userId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Application submitted successfully", result);
    });

    getUserApplications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const result = await this.jobApplicationService.getUserApplications(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Applications fetched successfully", result);
    });

    getJobApplications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { jobId } = req.params;
        const { cursor, limit } = req.query;
        const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
        const result = await this.jobApplicationService.getApplicationsForJob(jobId as string, userId, cursor as string, parsedLimit);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Job applications fetched successfully", result);
    });

    updateApplicationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await this.jobApplicationService.updateApplicationStatus(id as string, status, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Application status updated successfully", result);
    });
}
