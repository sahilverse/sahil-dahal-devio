import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { SubmissionService } from "./submission.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { plainToInstance } from "class-transformer";
import { SubmissionDto } from "./submission.dto";
import { StatusCodes } from "http-status-codes";

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

        const submission = await this.submissionService.submit(slug, code, language, userId, eventId);

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Submission processed", plainToInstance(SubmissionDto, submission));
    });
}
