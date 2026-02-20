import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { JobService } from "./job.service";

@injectable()
export class JobController {
    constructor(
        @inject(TYPES.JobService) private jobService: JobService
    ) { }

    createJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const job = await this.jobService.createJob(userId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Job posted successfully", job);
    });

    getJobBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;
        const job = await this.jobService.getJobBySlug(slug as string);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Job fetched successfully", job);
    });

    getJobs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const params = req.query;
        const result = await this.jobService.getJobs(params);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Jobs fetched successfully", result);
    });

    updateJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params;
        const job = await this.jobService.updateJob(id as string, userId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Job updated successfully", job);
    });

    deleteJob = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params;
        await this.jobService.deleteJob(id as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Job deleted successfully");
    });
}
