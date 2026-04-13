import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../services/SessionManager';
import { RedisStreamManager } from '../services/RedisStreamManager';
import DockerPool from '../services/DockerPool';
import { ExecutionService } from '../services/ExecutionService';
import Docker from 'dockerode';
import { ApiError } from '../utils/ApiError';

vi.mock('../utils/logger');

describe('SessionManager Unit Tests', () => {
    let sessionManager: SessionManager;
    let mockDocker: any;
    let mockDockerPool: any;
    let mockExecutionService: any;
    let mockRedisStreamManager: any;

    beforeEach(() => {
        vi.useFakeTimers();

        mockDocker = {
            getContainer: vi.fn().mockReturnValue({ id: 'test-container' }),
        };

        mockDockerPool = {
            getContainer: vi.fn().mockResolvedValue({ id: 'test-container' }),
            returnContainer: vi.fn().mockResolvedValue(undefined),
        };

        mockExecutionService = {
            executeCode: vi.fn().mockImplementation(async (_container, _code, _lang, _sid, streamData) => {
                streamData.stdout += 'execution output';
                streamData.stderr += '';
            }),
            sendInput: vi.fn(),
        };

        mockRedisStreamManager = {
            getAllSessionIds: vi.fn().mockResolvedValue([]),
            getSession: vi.fn().mockResolvedValue(null),
            saveSession: vi.fn().mockResolvedValue(undefined),
            removeSession: vi.fn().mockResolvedValue(undefined),
            subscribeToCommands: vi.fn().mockResolvedValue(undefined),
            unsubscribeFromCommands: vi.fn().mockResolvedValue(undefined),
        };

        sessionManager = new SessionManager(
            mockDocker as unknown as Docker,
            mockDockerPool as unknown as DockerPool,
            mockExecutionService as unknown as ExecutionService,
            mockRedisStreamManager as unknown as RedisStreamManager
        );
    });

    afterEach(() => {
        sessionManager.shutdown();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('should initialize and recover zero sessions if redis is empty', async () => {
        await sessionManager.initialize();
        expect(mockRedisStreamManager.getAllSessionIds).toHaveBeenCalled();
        expect(mockRedisStreamManager.getSession).not.toHaveBeenCalled();
    });

    it('should recover sessions from redis on initialize', async () => {
        const mockSession = {
            id: 'recovered-session',
            language: 'python',
            code: '',
            containerId: 'test-container',
            startTime: Date.now(),
            lastActivityTime: Date.now(),
            isActive: true
        };
        mockRedisStreamManager.getAllSessionIds.mockResolvedValue(['recovered-session']);
        mockRedisStreamManager.getSession.mockResolvedValue(mockSession);

        await sessionManager.initialize();

        expect(mockRedisStreamManager.getSession).toHaveBeenCalledWith('recovered-session');
        expect(mockRedisStreamManager.subscribeToCommands).toHaveBeenCalledWith(
            'recovered-session',
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('should start a session and save it to redis', async () => {
        const result = await sessionManager.startSession('python', 'new-session');

        expect(result.sessionId).toBe('new-session');
        expect(mockDockerPool.getContainer).toHaveBeenCalledWith('python');
        expect(mockRedisStreamManager.saveSession).toHaveBeenCalledWith('new-session', expect.objectContaining({
            id: 'new-session',
            language: 'python',
            containerId: 'test-container'
        }));
        expect(mockRedisStreamManager.subscribeToCommands).toHaveBeenCalledWith(
            'new-session',
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('should throw ApiError for unsupported language on startSession', async () => {
        await expect(sessionManager.startSession('unknown-lang')).rejects.toThrow(ApiError);
    });

    it('should execute code for an existing session', async () => {
        await sessionManager.startSession('python', 'exec-session');

        const result = await sessionManager.executeCode('exec-session', 'print("hello")');

        expect(result.stdout).toBe('execution output');
        expect(mockExecutionService.executeCode).toHaveBeenCalledWith(
            { id: 'test-container' },
            'print("hello")',
            'python',
            'exec-session',
            expect.any(Object)
        );
        expect(mockDocker.getContainer).toHaveBeenCalledWith('test-container');
    });

    it('should end a session properly', async () => {
        await sessionManager.startSession('python', 'end-session');

        await sessionManager.endSession('end-session');

        expect(mockRedisStreamManager.unsubscribeFromCommands).toHaveBeenCalledWith('end-session');
        expect(mockRedisStreamManager.removeSession).toHaveBeenCalledWith('end-session');
        expect(mockDockerPool.returnContainer).toHaveBeenCalledWith('python', { id: 'test-container' });
    });

    it('should clean up inactive sessions on interval', async () => {
        await sessionManager.startSession('python', 'inactive-session');

        await vi.advanceTimersByTimeAsync(6 * 60 * 1000);

        expect(mockRedisStreamManager.removeSession).toHaveBeenCalledWith('inactive-session');
        expect(mockDockerPool.returnContainer).toHaveBeenCalledWith('python', { id: 'test-container' });
    });
});
