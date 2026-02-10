import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { SubmissionService } from "./submission.service";
import { asyncHandler } from "../../utils";

@injectable()
export class SubmissionController {
    constructor(
        @inject(TYPES.SubmissionService) private submissionService: SubmissionService
    ) { }

    run = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug, code, language } = req.body;

        if (!slug || !code || !language) {
            return res.status(400).json({ message: "Slug, code, and language are required" });
        }

        const results = await this.submissionService.runSampleCases(slug, code, language);

        res.status(200).json({
            message: "Execution completed",
            results: results.map(r => ({
                token: r.token,
                status: r.status?.description,
                statusId: r.status?.id,
                stdout: r.stdout,
                stderr: r.stderr,
                compileOutput: r.compile_output,
                message: r.message,
                time: r.time,
                memory: r.memory
            }))
        });
    });

    submit = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
        const { slug, code, language, eventId } = req.body;
        const userId = req.user.id;

        if (!slug || !code || !language) {
            return res.status(400).json({ message: "Slug, code, and language are required" });
        }

        const submission = await this.submissionService.submit(slug, code, language, userId, eventId);

        res.status(200).json({
            message: "Submission processed",
            submission
        });
    });
}
