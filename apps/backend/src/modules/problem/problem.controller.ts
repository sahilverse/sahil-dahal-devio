import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { ProblemService } from "./problem.service";
import { ProblemDraftService } from "../problem-draft";
import { asyncHandler, ResponseHandler, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { SUPPORTED_LANGUAGES } from "@devio/boilerplate-generator";

@injectable()
export class ProblemController {
    constructor(
        @inject(TYPES.ProblemService) private problemService: ProblemService,
        @inject(TYPES.ProblemDraftService) private draftService: ProblemDraftService
    ) { }


    getLanguages = asyncHandler(async (_req: Request, res: Response) => {
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Supported languages", { languages: SUPPORTED_LANGUAGES });
    });

    handleMinioWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        if (payload.Event === 's3:TestEvent') {
            logger.info("Received MinIO TestEvent");
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Test event received");
        }

        if (payload.Records && Array.isArray(payload.Records)) {
            for (const record of payload.Records) {
                const bucket = record.s3.bucket.name;
                const key = decodeURIComponent(record.s3.object.key);

                this.problemService.handleMinioEvent(bucket, key).catch(err => {
                    logger.error(`Error in fire-and-forget MinIO event processing: ${err.message}`);
                });
            }
        }

    });

    getProblem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const slug = req.params.slug;

        if (!slug) {
            return ResponseHandler.sendResponse(res, StatusCodes.BAD_REQUEST, "Problem slug is required");
        }

        const problem = await this.problemService.getProblemBySlug(slug);

        if (!problem) {
            return ResponseHandler.sendResponse(res, StatusCodes.NOT_FOUND, "Problem not found");
        }

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Problem retrieved successfully", problem);
    });

    getBoilerplate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;
        const { language } = req.query;

        if (!slug || !language) {
            return ResponseHandler.sendResponse(res, StatusCodes.BAD_REQUEST, "Problem slug and language are required");
        }

        const code = await this.problemService.getBoilerplate(slug, language as string, req.user?.id);

        if (!code) {
            return ResponseHandler.sendResponse(res, StatusCodes.NOT_FOUND, "Boilerplate not found for this language");
        }

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Boilerplate retrieved successfully", { code });
    });

    saveDraft = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;
        const { language, code } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return ResponseHandler.sendResponse(res, StatusCodes.UNAUTHORIZED, "User not authenticated");
        }

        if (!slug || !language || code === undefined) {
            return ResponseHandler.sendResponse(res, StatusCodes.BAD_REQUEST, "Problem slug, language, and code are required");
        }

        // We need the problemId for the draft record
        const problem = await this.problemService.getProblemBySlug(slug);
        if (!problem) {
            return ResponseHandler.sendResponse(res, StatusCodes.NOT_FOUND, "Problem not found");
        }

        await this.draftService.saveDraft(userId, problem.id, language, code);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Draft saved successfully");
    });
}
