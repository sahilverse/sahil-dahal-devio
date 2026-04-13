import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionService, StreamData } from '../services/ExecutionService';
import { RedisStreamManager } from '../services/RedisStreamManager';
import Docker from 'dockerode';

vi.mock('../utils/logger'); 

describe('ExecutionService Unit Tests', () => {
    let executionService: ExecutionService;
    let mockRedisStreamManager: any;
    let mockContainer: any;

    beforeEach(() => {
        vi.useFakeTimers();

        mockRedisStreamManager = {
            publishOutput: vi.fn().mockResolvedValue(undefined),
        };

        mockContainer = {
            exec: vi.fn(),
        };

        executionService = new ExecutionService(mockRedisStreamManager as unknown as RedisStreamManager);
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('executeCode', () => {
        it('should correctly execute code and demux streams', async () => {
            const streamData: StreamData = { stdout: '', stderr: '' };
            const sessionId = 'test-session';
            
            // Mock writeFileToContainer execution
            const mockWriteExec = {
                start: vi.fn((opts, cb) => {
                    const stream = {
                        on: vi.fn((event, handler) => {
                            if (event === 'end' || event === 'close') {
                                setTimeout(handler, 10);
                            }
                            if (event === 'data') {
                                // simulate no data for write
                            }
                        })
                    };
                    cb(null, stream);
                })
            };

            // Mock actual code execution
            const mockRunExec = {
                start: vi.fn((opts, cb) => {
                    const stream = {
                        on: vi.fn((event, handler) => {
                            if (event === 'data') {
                                const stdoutPayload = Buffer.from('hello world\n');
                                const header = Buffer.alloc(8);
                                header[0] = 1; // stdout
                                header.writeUInt32BE(stdoutPayload.length, 4);
                                handler(Buffer.concat([header, stdoutPayload]));
                            }
                            if (event === 'end' || event === 'close') {
                                setTimeout(handler, 20);
                            }
                        }),
                        destroy: vi.fn()
                    };
                    cb(null, stream);
                })
            };

            mockContainer.exec
                .mockResolvedValueOnce(mockWriteExec)
                .mockResolvedValueOnce(mockRunExec)
                .mockResolvedValue({ start: vi.fn() });

            const execPromise = executionService.executeCode(
                mockContainer as unknown as Docker.Container,
                'print("hello world")',
                'python',
                sessionId,
                streamData
            );
            
            await vi.advanceTimersByTimeAsync(100);
            await execPromise;

            expect(mockContainer.exec).toHaveBeenCalledTimes(2);
            expect(streamData.stdout).toBe('hello world\n');
            expect(mockRedisStreamManager.publishOutput).toHaveBeenCalledWith(sessionId, 'stdout', 'hello world\n');
            expect(mockRedisStreamManager.publishOutput).toHaveBeenCalledWith(sessionId, 'exit', 0);
        });

        it('should handle execution timeout properly', async () => {
            const streamData: StreamData = { stdout: '', stderr: '' };
            const sessionId = 'test-session-timeout';
            
            const mockWriteExec = {
                start: vi.fn((opts, cb) => {
                    const stream = {
                        on: vi.fn((event, handler) => {
                            if (event === 'end' || event === 'close') {
                                setTimeout(handler, 10);
                            }
                        })
                    };
                    cb(null, stream);
                })
            };

            const mockRunExec = {
                start: vi.fn((opts, cb) => {
                    // Simulate a long running process that never ends
                    const stream = {
                        on: vi.fn(),
                        destroy: vi.fn()
                    };
                    cb(null, stream);
                })
            };

            const mockKillExec = {
                start: vi.fn().mockResolvedValue(undefined)
            };

            mockContainer.exec
                .mockResolvedValueOnce(mockWriteExec)
                .mockResolvedValueOnce(mockRunExec)
                .mockResolvedValueOnce(mockKillExec);

            const execPromise = executionService.executeCode(
                mockContainer as unknown as Docker.Container,
                'while True: pass',
                'python',
                sessionId,
                streamData
            );
            
            await vi.advanceTimersByTimeAsync(125000);
            await execPromise;

            expect(mockContainer.exec).toHaveBeenCalledTimes(3);
            expect(streamData.stderr).toContain('[Execution timed out]');
            expect(mockRedisStreamManager.publishOutput).toHaveBeenCalledWith(sessionId, 'exit', 1);
        });
    });
});
