import "reflect-metadata";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Container } from "inversify";
import { SubmissionService } from "./submission.service";
import { TYPES } from "../../types";
import { SubmissionStatus, ActivityType, CipherReason, ProblemSolutionStatus } from "../../generated/prisma/client";
import { JUDGE0_STATUS } from "./submission.constants";
import { ProblemService } from "../problem/problem.service";
import { SubmissionRepository } from "./submission.repository";
import { ProblemRepository } from "../problem/problem.repository";
import { StorageService } from "../storage/storage.service";
import { Judge0Service } from "./judge0.service";
import { ActivityService } from "../activity/activity.service";
import { CipherService } from "../cipher";
import { EventRepository } from "../event/event.repository";
import { EventService } from "../event/event.service";

describe("SubmissionService Unit Tests", () => {
    let container: Container;
    let submissionService: SubmissionService;

    let mockProblemService: ProblemService;
    let mockSubmissionRepo: SubmissionRepository;
    let mockProblemRepo: ProblemRepository;
    let mockStorageService: StorageService;
    let mockJudge0Service: Judge0Service;
    let mockActivityService: ActivityService;
    let mockCipherService: CipherService;
    let mockEventRepo: EventRepository;
    let mockEventService: EventService;

    const MOCK_USER_ID = "user-123";
    const MOCK_PROBLEM_ID = "prob-456";
    const MOCK_SLUG = "hello-world";
    const MOCK_CODE = "print('hello')";
    const BOILERPLATE = "START\n##USER_CODE_HERE##\nEND";

    beforeEach(() => {
        vi.useFakeTimers();
        container = new Container();

        mockProblemService = {
            getFullBoilerplate: vi.fn(),
            getProblemBySlug: vi.fn()
        } as any;
        mockSubmissionRepo = {
            createSubmission: vi.fn(),
            getUserProblemStatus: vi.fn(),
            upsertUserProblemStatus: vi.fn(),
            getBestSubmissionScore: vi.fn(),
            updateEventScore: vi.fn()
        } as any;
        mockProblemRepo = {
            findBySlug: vi.fn()
        } as any;
        mockStorageService = {
            getFile: vi.fn()
        } as any;
        mockJudge0Service = {
            createBatchSubmissions: vi.fn(),
            getBatchSubmissions: vi.fn()
        } as any;
        mockActivityService = { logActivity: vi.fn() } as any;
        mockCipherService = { awardCipher: vi.fn() } as any;
        mockEventRepo = {} as any;
        mockEventService = { emitLeaderboardUpdate: vi.fn() } as any;

        container.bind(TYPES.ProblemService).toConstantValue(mockProblemService);
        container.bind(TYPES.SubmissionRepository).toConstantValue(mockSubmissionRepo);
        container.bind(TYPES.ProblemRepository).toConstantValue(mockProblemRepo);
        container.bind(TYPES.StorageService).toConstantValue(mockStorageService);
        container.bind(TYPES.Judge0Service).toConstantValue(mockJudge0Service);
        container.bind(TYPES.ActivityService).toConstantValue(mockActivityService);
        container.bind(TYPES.CipherService).toConstantValue(mockCipherService);
        container.bind(TYPES.EventRepository).toConstantValue(mockEventRepo);
        container.bind(TYPES.EventService).toConstantValue(mockEventService);
        container.bind(SubmissionService).to(SubmissionService);

        submissionService = container.get(SubmissionService);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("submit() logic", () => {
        beforeEach(() => {
            vi.mocked(mockProblemRepo.findBySlug).mockResolvedValue({
                id: MOCK_PROBLEM_ID,
                slug: MOCK_SLUG,
                cipherReward: 100,
                testCases: [
                    { id: "tc1", inputPath: "in1.txt", outputPath: "out1.txt", isPublic: true },
                    { id: "tc2", inputPath: "in2.txt", outputPath: "out2.txt", isPublic: false }
                ]
            } as any);
            vi.mocked(mockProblemService.getFullBoilerplate).mockResolvedValue(BOILERPLATE);
            vi.mocked(mockStorageService.getFile).mockResolvedValue("mocked-data");
            vi.mocked(mockJudge0Service.createBatchSubmissions).mockResolvedValue(["token1", "token2"]);
        });

        it("should process an ACCEPTED submission for a first-time solver", async () => {
            vi.mocked(mockJudge0Service.getBatchSubmissions).mockResolvedValue([
                { token: "t1", status: { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" }, time: "0.1", memory: 100, stdout: "ok" },
                { token: "t2", status: { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" }, time: "0.2", memory: 200, stdout: "ok" }
            ]);
            vi.mocked(mockSubmissionRepo.createSubmission).mockResolvedValue({ id: "sub-1" } as any);
            vi.mocked(mockSubmissionRepo.getUserProblemStatus).mockResolvedValue(null);

            const promise = submissionService.submit(MOCK_SLUG, MOCK_CODE, "python", MOCK_USER_ID, { awardBounty: true });

            await vi.runAllTimersAsync();
            const result = await promise;

            expect(mockProblemService.getFullBoilerplate).toHaveBeenCalledWith(MOCK_SLUG, "python");
            expect(mockJudge0Service.createBatchSubmissions).toHaveBeenCalled();
            expect(mockSubmissionRepo.createSubmission).toHaveBeenCalledWith(expect.objectContaining({
                score: 100,
                status: SubmissionStatus.ACCEPTED
            }));
            expect(mockCipherService.awardCipher).toHaveBeenCalledWith(MOCK_USER_ID, 100, CipherReason.PROBLEM_SOLVED_BOUNTY, MOCK_PROBLEM_ID);
        });

        it("should correctly aggregate scores for partial correctness (50%)", async () => {
            vi.mocked(mockJudge0Service.getBatchSubmissions).mockResolvedValue([
                { token: "t1", status: { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" }, time: "0.1", memory: 100 },
                { token: "t2", status: { id: JUDGE0_STATUS.WRONG_ANSWER, description: "Wrong Answer" }, time: "0.1", memory: 100 }
            ]);
            vi.mocked(mockSubmissionRepo.createSubmission).mockResolvedValue({ id: "sub-2" } as any);

            const promise = submissionService.submit(MOCK_SLUG, MOCK_CODE, "python", MOCK_USER_ID, { awardBounty: true });
            await vi.runAllTimersAsync();
            await promise;

            expect(mockSubmissionRepo.createSubmission).toHaveBeenCalledWith(expect.objectContaining({
                score: 50,
                status: SubmissionStatus.WRONG_ANSWER
            }));
        });

        it("should handle event submissions and calculate score deltas", async () => {
            const MOCK_EVENT_ID = "event-789";
            vi.mocked(mockJudge0Service.getBatchSubmissions).mockResolvedValue([
                { token: "t1", status: { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" }, time: "0.1", memory: 100 },
                { token: "t2", status: { id: JUDGE0_STATUS.ACCEPTED, description: "Accepted" }, time: "0.1", memory: 100 }
            ]);
            vi.mocked(mockSubmissionRepo.createSubmission).mockResolvedValue({ id: "sub-3" } as any);
            vi.mocked(mockSubmissionRepo.getBestSubmissionScore).mockResolvedValue(60);

            const promise = submissionService.submit(MOCK_SLUG, MOCK_CODE, "python", MOCK_USER_ID, {
                eventId: MOCK_EVENT_ID,
                awardBounty: false
            });
            await vi.runAllTimersAsync();
            await promise;

            expect(mockSubmissionRepo.updateEventScore).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_EVENT_ID, 40);
            expect(mockEventService.emitLeaderboardUpdate).toHaveBeenCalledWith(MOCK_EVENT_ID);
        });
    });
});
