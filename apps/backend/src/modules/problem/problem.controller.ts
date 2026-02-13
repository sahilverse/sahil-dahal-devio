import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { ProblemService } from "./problem.service";
import { ProblemSyncService } from "./problem-sync.service";
import { ProblemDraftService } from "./draft";
import { asyncHandler, ResponseHandler, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { SUPPORTED_LANGUAGES } from "@devio/boilerplate-generator";
import { GetProblemsQuery, GetBoilerplateQuery, SaveDraftRequest } from "@devio/zod-utils";

@injectable()
export class ProblemController {
    constructor(
        @inject(TYPES.ProblemService) private problemService: ProblemService,
        @inject(TYPES.ProblemSyncService) private syncService: ProblemSyncService,
        @inject(TYPES.ProblemDraftService) private draftService: ProblemDraftService
    ) { }

    getLanguages = asyncHandler(async (_req: Request, res: Response) => {
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Supported languages", SUPPORTED_LANGUAGES);
    });

    list = asyncHandler(async (req: any, res: Response) => {
        const query = req.query as GetProblemsQuery;
        const userId = req.user?.id;

        const results = await this.problemService.getListing(query, userId);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Problems retrieved", results);
    });

    handleMinioWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const eventName = payload.EventName || (payload.Records?.[0]?.eventName);

        if (payload.Event === 's3:TestEvent') {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Test event received");
        }

        if (!eventName?.startsWith('s3:ObjectCreated:')) {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Event ignored");
        }

        if (payload.Records && Array.isArray(payload.Records)) {
            for (const record of payload.Records) {
                const bucket = record.s3.bucket.name;
                const key = decodeURIComponent(record.s3.object.key);

                this.syncService.handleMinioEvent(bucket, key).catch((err: Error) => {
                    logger.error(`MinIO event bridge failed for ${key}: ${err.message}`);
                });
            }
        }

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Processing triggered");
    });

    getProblem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const slug = req.params.slug;

        if (!slug) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Slug is required");
        }

        const problem = await this.problemService.getProblemBySlug(slug);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Problem retrieved", problem);
    });

    getBoilerplate = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const slug = req.params.slug;
        const { language } = req.query as GetBoilerplateQuery;
        const userId = req.user?.id;

        if (!slug || !language) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Slug and language are required");
        }

        const code = await this.problemService.getBoilerplate(slug, language, userId);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Boilerplate retrieved", { code });
    });

    saveDraft = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const slug = req.params.slug;
        const { language, code } = req.body as SaveDraftRequest;
        const userId = req.user?.id;

        if (!userId) {
            return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, "User not authenticated");
        }

        if (!slug || !language || !code) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Missing required fields");
        }

        const problem = await this.problemService.getProblemBySlug(slug);
        if (!problem) {
            return ResponseHandler.sendError(res, StatusCodes.NOT_FOUND, "Problem not found");
        }

        await this.draftService.saveDraft(userId, (problem as any).id, language, code);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Draft saved successfully");
    });
}
