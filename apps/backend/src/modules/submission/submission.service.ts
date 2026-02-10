import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ProblemService } from "../problem/problem.service";
import { Judge0Service, Judge0Response } from "./judge0.service";
import { JUDGE0_LANGUAGE_IDS, JUDGE0_STATUS, SUBMISSION_POLL_INTERVAL, SUBMISSION_MAX_POLLS } from "./submission.constants";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { SubmissionRepository } from "./submission.repository";
import { ProblemRepository } from "../problem/problem.repository";
import { SubmissionStatus, Problem as PrismaProblem, TestCase, ActivityType } from "../../generated/prisma/client";
import { StorageService } from "../storage/storage.service";
import { ActivityService } from "../activity/activity.service";

type ProblemWithRelations = PrismaProblem & { testCases: TestCase[] };

@injectable()
export class SubmissionService {
    constructor(
        @inject(TYPES.ProblemService) private problemService: ProblemService,
        @inject(TYPES.SubmissionRepository) private submissionRepository: SubmissionRepository,
        @inject(TYPES.ProblemRepository) private problemRepository: ProblemRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.Judge0Service) private judge0Service: Judge0Service,
        @inject(TYPES.ActivityService) private activityService: ActivityService
    ) { }

    async submit(slug: string, code: string, language: string, userId: string, eventId?: string) {
        // 1. Fetch Full Problem (to get ALL test cases)
        const problem = await this.problemRepository.findBySlug(slug) as unknown as ProblemWithRelations;
        if (!problem) throw new ApiError("Problem not found", StatusCodes.NOT_FOUND);

        if (!problem.testCases || problem.testCases.length === 0) {
            throw new ApiError("No test cases available for this problem", StatusCodes.BAD_REQUEST);
        }

        // 2. Fetch Full Boilerplate
        const fullBoilerplate = await this.problemService.getFullBoilerplate(slug, language);
        if (!fullBoilerplate) throw new ApiError(`Full boilerplate not found for ${language}`, StatusCodes.NOT_FOUND);

        // 3. Wrap Code
        const sourceCode: string = fullBoilerplate.replace("##USER_CODE_HERE##", code);
        const languageId = JUDGE0_LANGUAGE_IDS[language];
        if (!languageId) throw new ApiError(`Unsupported language: ${language}`, StatusCodes.BAD_REQUEST);

        // 4. Load ALL Test Case Data from Storage
        const submissions = await Promise.all(problem.testCases.map(async (tc) => {
            const stdin = await this.storageService.getFile(tc.inputPath, "devio-problems").catch(() => "");
            const expectedOutput = await this.storageService.getFile(tc.outputPath, "devio-problems").catch(() => "");

            return {
                source_code: sourceCode,
                language_id: languageId,
                stdin: stdin.replace(/\r/g, "").trimEnd(),
                expected_output: expectedOutput.replace(/\r/g, "").trimEnd()
            };
        }));

        // 5. Submit Batch to Judge0
        const tokens = await this.judge0Service.createBatchSubmissions(submissions);
        const results = await this.pollBatchResults(tokens);

        // 6. Aggregate Results
        let totalScore = 0;
        let finalStatus: SubmissionStatus = SubmissionStatus.ACCEPTED;
        let maxRuntime = 0;
        let maxMemory = 0;
        let firstErrorMessage = "";

        for (const res of results) {
            const status = this.mapJudge0ToSubmissionStatus(res.status?.id || 0);

            // Stats
            maxRuntime = Math.max(maxRuntime, parseFloat(res.time || "0") * 1000); // to ms
            maxMemory = Math.max(maxMemory, res.memory || 0); // to KB

            if (status === SubmissionStatus.ACCEPTED) {
                totalScore += (100 / results.length);
            } else {
                if (finalStatus === SubmissionStatus.ACCEPTED) {
                    finalStatus = status;
                    firstErrorMessage = res.compile_output || res.message || res.stderr || "";
                }
            }
        }

        const finalScore = Math.floor(totalScore);

        // 7. Persist Result
        const submission = await this.submissionRepository.createSubmission({
            userId,
            problemId: problem.id,
            language,
            code,
            status: finalStatus,
            score: finalScore,
            runtime: Math.floor(maxRuntime),
            memory: maxMemory,
            error: firstErrorMessage,
            eventId
        });

        // 8. Update User Status / Event Score
        await this.submissionRepository.upsertUserProblemStatus(userId, problem.id, finalScore);

        if (eventId) {
            // Calculate limit: improvements only
            const previousBest = await this.submissionRepository.getBestSubmissionScore(userId, problem.id, eventId);
            const scoreDelta = Math.max(0, finalScore - previousBest);

            if (scoreDelta > 0) {
                await this.submissionRepository.updateEventScore(userId, eventId, scoreDelta);
            }
        }

        // 9. Log Activity
        const activityType = finalScore === 100 ? ActivityType.PROBLEM_SOLVED : ActivityType.PROBLEM_ATTEMPT;
        await this.activityService.logActivity(userId, activityType);

        return { ...submission, results };
    }

    private mapJudge0ToSubmissionStatus(judge0StatusId: number): SubmissionStatus {
        switch (judge0StatusId) {
            case JUDGE0_STATUS.ACCEPTED: return SubmissionStatus.ACCEPTED;
            case JUDGE0_STATUS.WRONG_ANSWER: return SubmissionStatus.WRONG_ANSWER;
            case JUDGE0_STATUS.TIME_LIMIT_EXCEEDED: return SubmissionStatus.TIME_LIMIT;
            case JUDGE0_STATUS.MEMORY_LIMIT_EXCEEDED: return SubmissionStatus.MEMORY_LIMIT;
            case JUDGE0_STATUS.COMPILE_ERROR: return SubmissionStatus.COMPILE_ERROR;
            default: return SubmissionStatus.RUNTIME_ERROR;
        }
    }

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
