import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Docker from 'dockerode';
import DockerPool from '../services/DockerPool';
import { LANGUAGE_CONFIG } from '../config/languages';

vi.mock('dockerode');
vi.mock('../utils/logger');

describe('DockerPool Unit Tests', () => {
    let dockerPool: DockerPool;
    let mockDocker: any;
    let mockContainer: any;

    const config = {
        maxPoolSize: 2,
        initialPoolSize: 1,
        idleTimeout: 30000
    };

    beforeEach(() => {
        vi.useFakeTimers();

        mockContainer = {
            id: 'test-container-id',
            start: vi.fn().mockResolvedValue({}),
            stop: vi.fn().mockResolvedValue({}),
            remove: vi.fn().mockResolvedValue({}),
            exec: vi.fn().mockResolvedValue({
                start: vi.fn((options, cb) => {
                    const stream = {
                        on: vi.fn((event, handler) => {
                            if (event === 'end' || event === 'close') {
                                setTimeout(handler, 10);
                            }
                        })
                    };
                    cb(null, stream);
                })
            })
        };

        mockDocker = {
            createContainer: vi.fn().mockResolvedValue(mockContainer),
            listContainers: vi.fn().mockResolvedValue([]),
            getContainer: vi.fn().mockReturnValue(mockContainer),
        };

        dockerPool = new DockerPool(mockDocker as unknown as Docker, config);
    });

    afterEach(async () => {
        await dockerPool.shutdown();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize empty pools for all languages', () => {
            const stats = dockerPool.getPoolStats();
            expect(Object.keys(stats)).toEqual(Object.keys(LANGUAGE_CONFIG));
        });

        it('should create initial containers on startup', async () => {
            await dockerPool.waitForInitialization();

            const stats = dockerPool.getPoolStats();
            Object.values(stats).forEach(stat => {
                expect(stat.available).toBe(1);
            });
            expect(mockDocker.createContainer).toHaveBeenCalled();
        });
    });

    describe('Container Management', () => {
        it('should reuse an existing container from the pool', async () => {
            await dockerPool.waitForInitialization();

            const container = await dockerPool.getContainer('python');
            expect(container.id).toBe('test-container-id');

            const stats = dockerPool.getPoolStats();
            expect(stats['python']?.available).toBe(0);
        });

        it('should create a new container if pool is empty but below maxPoolSize', async () => {
            await dockerPool.waitForInitialization();

            await dockerPool.getContainer('python');
            const container2 = await dockerPool.getContainer('python');
            expect(mockDocker.createContainer).toHaveBeenCalledTimes(Object.keys(LANGUAGE_CONFIG).length + 1);
            expect(container2).toBeDefined();
        });

        it('should return a container to the pool and clean it', async () => {
            await dockerPool.waitForInitialization();
            const container = await dockerPool.getContainer('python');

            const returnPromise = dockerPool.returnContainer('python', container);
            await vi.advanceTimersByTimeAsync(15000);
            await returnPromise;

            const stats = dockerPool.getPoolStats();
            expect(stats['python']?.available).toBe(1);
            expect(container.exec).toHaveBeenCalled();
        });
    });

    describe('Cleanup Logic', () => {
        it('should cleanup existing sandbox containers on startup', async () => {
            mockDocker.listContainers.mockResolvedValue([
                {
                    Id: 'old-container',
                    Labels: { 'devio.sandbox.language': 'python' },
                    State: 'running',
                    Names: ['/old']
                }
            ]);

            const newPool = new DockerPool(mockDocker as unknown as Docker, config);
            await newPool.waitForInitialization();

            expect(mockDocker.getContainer).toHaveBeenCalledWith('old-container');
            expect(mockContainer.stop).toHaveBeenCalled();
            expect(mockContainer.remove).toHaveBeenCalled();

            await newPool.shutdown();
        });
    });
});
