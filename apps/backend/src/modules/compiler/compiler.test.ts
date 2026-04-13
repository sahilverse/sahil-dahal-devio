import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { CompilerService } from "./compiler.service";
import { TYPES } from "../../types";

// Mock Axios globally
vi.mock("axios", () => {
    const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
    };
    return {
        default: {
            create: vi.fn(() => mockAxiosInstance),
        },
    };
});

describe("CompilerService Unit Tests", () => {
    let container: Container;
    let compilerService: CompilerService;
    let mockRedisManager: any;
    let mockAxios: any;

    const MOCK_SESSION_ID = "session_123";
    const MOCK_CODE = 'print("Hello World")';

    beforeEach(() => {
        container = new Container();

        // 1. Setup Redis Mock
        const mockRedis = {
            exists: vi.fn(),
            publish: vi.fn().mockResolvedValue(1),
        };
        mockRedisManager = {
            getPub: vi.fn().mockReturnValue(mockRedis),
        };

        // 2. Setup Axios Mock
        mockAxios = (axios.create as any)();

        // 3. Dependency Injection
        container.bind(TYPES.RedisManager).toConstantValue(mockRedisManager);
        container.bind(CompilerService).to(CompilerService);

        compilerService = container.get(CompilerService);
        vi.clearAllMocks();
    });

    describe("getLanguages()", () => {
        it("should successfully fetch and transform language list", async () => {
            const rawData = { result: { languages: ["python", "javascript", "c", "cpp", "java"] } };
            mockAxios.get.mockResolvedValue({ data: rawData });

            const result = await compilerService.getLanguages();

            expect(mockAxios.get).toHaveBeenCalledWith("/languages");
            expect(result.languages).toHaveLength(1);
            expect(result.languages[0]).toBe("python");
        });

        it("should throw ApiError if sandbox API fails", async () => {
            mockAxios.get.mockRejectedValue({
                response: { data: { message: "Sandbox Offline" }, status: StatusCodes.SERVICE_UNAVAILABLE }
            });

            await expect(compilerService.getLanguages())
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.SERVICE_UNAVAILABLE }));
        });
    });

    describe("executeCode()", () => {
        const execRequest = {
            sessionId: MOCK_SESSION_ID,
            language: "python",
            code: MOCK_CODE
        };

        it("should start a NEW session if it does not exist in Redis", async () => {
            const redis = mockRedisManager.getPub();
            redis.exists.mockResolvedValue(0);
            mockAxios.post.mockResolvedValue({ data: { result: { sessionId: MOCK_SESSION_ID } } });

            await compilerService.executeCode(execRequest);

            // Verify Session Start call
            expect(mockAxios.post).toHaveBeenCalledWith("/session/start", expect.objectContaining({
                sessionId: MOCK_SESSION_ID,
                language: "python"
            }));

            // Verify Redis Publish
            expect(redis.publish).toHaveBeenCalledWith(
                `sandbox:command:${MOCK_SESSION_ID}`,
                expect.stringContaining(MOCK_CODE.replace(/"/g, '\\"'))
            );
        });

        it("should reuse EXISTING session if found in Redis", async () => {
            const redis = mockRedisManager.getPub();
            redis.exists.mockResolvedValue(1); // 1 = Exists

            await compilerService.executeCode(execRequest);

            // Verify Session Start was SKIPPED
            expect(mockAxios.post).not.toHaveBeenCalled();

            // Verify Redis Publish still happened
            expect(redis.publish).toHaveBeenCalledWith(
                `sandbox:command:${MOCK_SESSION_ID}`,
                expect.stringContaining(MOCK_CODE.replace(/"/g, '\\"'))
            );
        });

        it("should handle session creation failure with internal error", async () => {
            mockRedisManager.getPub().exists.mockResolvedValue(0);
            mockAxios.post.mockRejectedValue(new Error("Network Error"));

            await expect(compilerService.executeCode(execRequest))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR }));
        });
    });

    describe("endSession()", () => {
        it("should correctly call session end but ignore 404 errors", async () => {
            mockAxios.post.mockRejectedValue({ response: { status: StatusCodes.NOT_FOUND } });

            // Should not throw
            await expect(compilerService.endSession(MOCK_SESSION_ID)).resolves.not.toThrow();
            expect(mockAxios.post).toHaveBeenCalledWith(`/session/${MOCK_SESSION_ID}/end`);
        });
    });
});
