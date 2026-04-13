import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';

vi.mock('../config/constants', () => ({
    REDIS_URL: 'redis://localhost:6379',
    VIDEO_TRANSCODE_QUEUE: 'video-transcode'
}));
vi.mock('../utils/logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));
vi.mock('../processor', () => ({
    processVideo: vi.fn().mockResolvedValue({ variants: ['360p', '720p'], duration: 120 })
}));
vi.mock('../config/storage', () => ({
    downloadFile: vi.fn().mockResolvedValue(undefined),
    uploadDirectory: vi.fn().mockResolvedValue(undefined),
    deletePrefix: vi.fn().mockResolvedValue(undefined)
}));

const mockWorkerOn = vi.fn();
const mockWorkerInstance = { on: mockWorkerOn };
let capturedProcessor: any = null;

vi.mock('bullmq', () => {
    const WorkerMock = function (_queue: any, processor: any, _opts: any) {
        capturedProcessor = processor;
        return mockWorkerInstance;
    };
    return { Worker: WorkerMock };
});
vi.mock('ioredis', () => {
    const RedisMock = function () { return {}; };
    return { default: RedisMock };
});
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();
    return {
        ...actual,
        existsSync: vi.fn().mockReturnValue(true),
        rmSync: vi.fn()
    };
});

import { createTranscodeWorker } from '../worker';
import { downloadFile, uploadDirectory, deletePrefix } from '../config/storage';
import { processVideo } from '../processor';

describe('Worker Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedProcessor = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create a BullMQ worker and register event handlers', () => {
        createTranscodeWorker();

        expect(mockWorkerOn).toHaveBeenCalledWith('active', expect.any(Function));
        expect(mockWorkerOn).toHaveBeenCalledWith('completed', expect.any(Function));
        expect(mockWorkerOn).toHaveBeenCalledWith('failed', expect.any(Function));
        expect(mockWorkerOn).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should execute the full transcode pipeline on job processing', async () => {
        createTranscodeWorker();
        expect(capturedProcessor).toBeDefined();

        const mockJob = {
            id: 'job-123',
            data: { lessonId: 'lesson-abc', rawVideoKey: 'temp/lesson-abc/video.mp4' },
            updateProgress: vi.fn().mockResolvedValue(undefined)
        };

        const result = await capturedProcessor(mockJob);

        expect(downloadFile).toHaveBeenCalledWith('temp/lesson-abc/video.mp4', expect.stringContaining('video.mp4'));
        expect(processVideo).toHaveBeenCalled();
        expect(uploadDirectory).toHaveBeenCalled();
        expect(deletePrefix).toHaveBeenCalledWith('temp/lesson-abc');
        expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
        expect(result).toHaveProperty('lessonId', 'lesson-abc');
        expect(result).toHaveProperty('variants');
        expect(result).toHaveProperty('duration', 120);
    });

    it('should cleanup temp directory even when transcode fails', async () => {
        (processVideo as any).mockRejectedValueOnce(new Error('FFmpeg crashed'));

        createTranscodeWorker();
        const mockJob = {
            id: 'job-fail',
            data: { lessonId: 'lesson-xyz', rawVideoKey: 'temp/lesson-xyz/video.mp4' },
            updateProgress: vi.fn().mockResolvedValue(undefined)
        };

        await expect(capturedProcessor(mockJob)).rejects.toThrow('FFmpeg crashed');
        expect(fs.rmSync).toHaveBeenCalled();
    });

    it('should report progress at each pipeline stage', async () => {
        createTranscodeWorker();
        const mockJob = {
            id: 'job-progress',
            data: { lessonId: 'lesson-prog', rawVideoKey: 'temp/lesson-prog/video.mp4' },
            updateProgress: vi.fn().mockResolvedValue(undefined)
        };

        await capturedProcessor(mockJob);

        expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
        expect(mockJob.updateProgress).toHaveBeenCalledWith(80);
        expect(mockJob.updateProgress).toHaveBeenCalledWith(95);
        expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    });
});
