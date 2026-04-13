import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('../config/constants', () => ({
    FFMPEG_PATH: 'ffmpeg',
    DISABLE_GPU: true
}));
vi.mock('../utils/logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));
vi.mock('child_process', () => ({ exec: vi.fn() }));
vi.mock('util', async (importOriginal) => {
    const actual = await importOriginal<typeof import('util')>();
    return { ...actual, promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: '' })) };
});

const mockRun = vi.fn();
const mockOn = vi.fn();
const mockOutput = vi.fn().mockReturnThis();
const mockOutputOptions = vi.fn().mockReturnThis();

vi.mock('fluent-ffmpeg', () => {
    const ffmpegInstance = () => ({
        outputOptions: mockOutputOptions,
        output: mockOutput,
        on: mockOn,
        run: mockRun
    });
    ffmpegInstance.setFfmpegPath = vi.fn();
    ffmpegInstance.ffprobe = vi.fn((_path: string, cb: any) => {
        cb(null, {
            streams: [{ codec_type: 'video', width: 1920, height: 1080 }],
            format: { duration: 120 }
        });
    });
    return { default: ffmpegInstance };
});

vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();
    return { ...actual, existsSync: vi.fn().mockReturnValue(true), mkdirSync: vi.fn(), rmSync: vi.fn() };
});

import { processVideo } from '../processor';

describe('Processor Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockOn.mockImplementation(function (this: any, event: string, cb: any) {
            if (event === 'end') process.nextTick(() => cb());
            return this;
        });
    });

    it('should create output directory if it does not exist', async () => {
        (fs.existsSync as any).mockReturnValueOnce(false);
        await processVideo('/tmp/input.mp4', '/tmp/output');
        expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/output', { recursive: true });
    });

    it('should filter variants to those <= source resolution', async () => {
        const result = await processVideo('/tmp/input.mp4', '/tmp/output');
        expect(result.variants).toContain('360p');
        expect(result.variants).toContain('480p');
        expect(result.variants).toContain('720p');
        expect(result.variants).toContain('1080p');
        expect(result.duration).toBe(120);
    });

    it('should use at least one variant even for very low resolution sources', async () => {
        const ffmpeg = await import('fluent-ffmpeg');
        (ffmpeg.default as any).ffprobe = vi.fn((_path: string, cb: any) => {
            cb(null, {
                streams: [{ codec_type: 'video', width: 320, height: 240 }],
                format: { duration: 60 }
            });
        });

        const result = await processVideo('/tmp/low_res.mp4', '/tmp/output');
        expect(result.variants.length).toBeGreaterThanOrEqual(1);
        expect(result.variants).toContain('360p');
    });

    it('should invoke ffmpeg with HLS output options', async () => {
        await processVideo('/tmp/input.mp4', '/tmp/output');
        expect(mockOutputOptions).toHaveBeenCalled();
        const args = mockOutputOptions.mock.calls[0]?.[0] as string[];
        expect(args).toContain('-f');
        expect(args).toContain('hls');
        expect(args).toContain('-master_pl_name');
        expect(args).toContain('master.m3u8');
    });

    it('should reject when ffmpeg emits an error', async () => {
        mockOn.mockImplementation(function (this: any, event: string, cb: any) {
            if (event === 'error') process.nextTick(() => cb(new Error('FFmpeg crashed')));
            return this;
        });

        await expect(processVideo('/tmp/input.mp4', '/tmp/output')).rejects.toThrow('FFmpeg crashed');
    });
});
