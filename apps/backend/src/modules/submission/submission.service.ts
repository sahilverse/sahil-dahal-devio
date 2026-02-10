import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ProblemService } from "../problem/problem.service";
import { Judge0Service, Judge0Response } from "./judge0.service";
import { JUDGE0_LANGUAGE_IDS, JUDGE0_STATUS, SUBMISSION_POLL_INTERVAL, SUBMISSION_MAX_POLLS } from "./submission.constants";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class SubmissionService {
    constructor(
        @inject(TYPES.ProblemService) private problemService: ProblemService,
        @inject(TYPES.Judge0Service) private judge0Service: Judge0Service
    ) { }

    async runSampleCases(slug: string, code: string, language: string) {
        // 1. Fetch Problem & Samples
        const problem = await this.problemService.getProblemBySlug(slug);
        if (!problem) throw new ApiError("Problem not found", StatusCodes.NOT_FOUND);

        if (!problem.testCases || problem.testCases.length === 0) {
            throw new ApiError("No sample test cases available for this problem", StatusCodes.BAD_REQUEST);
        }

        // 2. Fetch Full Boilerplate (Execution Wrapper)
        const fullBoilerplate = await this.problemService.getFullBoilerplate(slug, language);
        if (!fullBoilerplate) throw new ApiError(`Full boilerplate not found for ${language}`, StatusCodes.NOT_FOUND);

        // 3. Wrap Code
        const PLACEHOLDER = "##USER_CODE_HERE##";
        const sourceCode: string = fullBoilerplate.replace(PLACEHOLDER, code);

        const languageId = JUDGE0_LANGUAGE_IDS[language];

        if (!languageId) throw new ApiError(`Unsupported language for judging: ${language}`, StatusCodes.BAD_REQUEST);

        // 4. Submit Batch to Judge0 (One for each sample)
        const submissions = problem.testCases.map(tc => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: tc.input,
            expected_output: tc.output
        }));

        const tokens = await this.judge0Service.createBatchSubmissions(submissions);

        // 5. Poll for Results
        return this.pollBatchResults(tokens);
    }

    private async pollBatchResults(tokens: string[]): Promise<Judge0Response[]> {
        let results: Judge0Response[] = [];
        let attempts = 0;

        while (attempts < SUBMISSION_MAX_POLLS) {
            results = await this.judge0Service.getBatchSubmissions(tokens);

            const allDone = results.every(res =>
                res.status && res.status.id > JUDGE0_STATUS.PROCESSING
            );

            if (allDone) return results;

            attempts++;
            await new Promise(resolve => setTimeout(resolve, SUBMISSION_POLL_INTERVAL));
        }

        logger.warn(`Polling timed out for tokens: ${tokens.join(",")}`);
        return results;
    }
}
