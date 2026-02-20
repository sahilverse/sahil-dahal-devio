import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { SubmissionService } from "./submission.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { plainToInstance } from "class-transformer";
import { SubmissionDto } from "./submission.dto";
import { StatusCodes } from "http-status-codes";
import { GetSubmissionsQuery } from "@devio/zod-utils";

@injectable()
export class SubmissionController {
    constructor(
        @inject(TYPES.SubmissionService) private submissionService: SubmissionService
    ) { }

    run = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug, code, language } = req.body;
        const results = await this.submissionService.runSampleCases(slug, code, language);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Execution completed", results);
    });

    submit = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const { slug, code, language, eventId } = req.body;
        const userId = req.user.id;

        const timezoneOffsetHeader = req.headers['x-timezone-offset'];
        const timezoneOffset = timezoneOffsetHeader ? parseInt(timezoneOffsetHeader as string, 10) : undefined;

        const submission = await this.submissionService.submit(slug, code, language, userId, {
            eventId,
            awardBounty: true,
            timezoneOffset
        });

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Submission processed", plainToInstance(SubmissionDto, submission));
    });

    list = asyncHandler(async (req: any, res: Response) => {
        const { slug } = req.params;
        const query = req.query as GetSubmissionsQuery;
        const userId = req.user.id;

        const result = await this.submissionService.getUserSubmissions(userId, slug, query);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Submissions retrieved", {
            items: plainToInstance(SubmissionDto, result.items),
            nextCursor: result.nextCursor
        });
    });

    submitToEvent = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const { id: eventId, slug } = req.params;
        const { code, language } = req.body;
        const userId = req.user.id;

        const timezoneOffsetHeader = req.headers['x-timezone-offset'];
        const timezoneOffset = timezoneOffsetHeader ? parseInt(timezoneOffsetHeader as string, 10) : undefined;

        // Event submissions DO NOT award bounties
        const submission = await this.submissionService.submit(slug, code, language, userId, {
            eventId,
            awardBounty: false,
            timezoneOffset
        });

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Event submission processed", plainToInstance(SubmissionDto, submission));
    });
}
