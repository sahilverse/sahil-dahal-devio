import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { REDIS_URL, VIDEO_TRANSCODE_QUEUE } from "./config/constants";
import { downloadFile, uploadDirectory, deletePrefix } from "./config/storage";
import { processVideo } from "./processor";
import { logger } from "./utils/logger";

export interface VideoTranscodePayload {
    lessonId: string;
    rawVideoKey: string;
}

export function createTranscodeWorker(): Worker<VideoTranscodePayload> {
    const connection = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
    });

    const worker = new Worker<VideoTranscodePayload>(
        VIDEO_TRANSCODE_QUEUE,
        async (job: Job<VideoTranscodePayload>) => {
            const { lessonId, rawVideoKey } = job.data;
            logger.info(`[Job ${job.id}] Starting transcode for lesson: ${lessonId}`);

            // Create a temporary working directory
            const tmpDir = path.join(os.tmpdir(), `devio-transcode-${job.id}`);
            const rawVideoPath = path.join(tmpDir, "raw", path.basename(rawVideoKey));
            const outputDir = path.join(tmpDir, "output");

            try {
                // Step 1: Download raw video from MinIO
                logger.info(`[Job ${job.id}] Downloading raw video: ${rawVideoKey}`);
                await downloadFile(rawVideoKey, rawVideoPath);
                await job.updateProgress(10);

                // Step 2: Transcode to HLS
                logger.info(`[Job ${job.id}] Starting FFmpeg transcoding...`);
                const { variants, duration } = await processVideo(rawVideoPath, outputDir);
                await job.updateProgress(80);
                logger.info(`[Job ${job.id}] Transcoded variants: ${variants.join(", ")} | Duration: ${duration}s`);

                // Step 3: Upload HLS bundle to MinIO
                const processedPrefix = `courses/${lessonId}`;
                logger.info(`[Job ${job.id}] Uploading HLS bundle to: ${processedPrefix}`);
                await uploadDirectory(outputDir, processedPrefix);
                await job.updateProgress(95);

                // Step 4: No DB update here, the backend will observe this job's completion
                const masterPlaylistUrl = `courses/${lessonId}/master.m3u8`;

                // Step 5: Cleanup - delete raw video from temp bucket
                try {
                    await deletePrefix(rawVideoKey);
                } catch (cleanupErr: any) {
                    logger.warn(`[Job ${job.id}] Failed to cleanup raw video: ${cleanupErr.message}`);
                }

                await job.updateProgress(100);
                logger.info(`[Job ${job.id}] Transcode complete for lesson: ${lessonId}`);

                return { lessonId, masterPlaylistUrl, variants, duration };
            } catch (error: any) {
                logger.error(`[Job ${job.id}] Transcode failed: ${error.message}`);
                throw error;
            } finally {
                // Cleanup temporary directory
                if (fs.existsSync(tmpDir)) {
                    fs.rmSync(tmpDir, { recursive: true, force: true });
                    logger.debug(`[Job ${job.id}] Cleaned up temp directory: ${tmpDir}`);
                }
            }
        },
        {
            connection,
            concurrency: 1,
            lockDuration: 300000,
            limiter: {
                max: 1,
                duration: 1000,
            },
        }
    );

    worker.on("active", (job) => {
        logger.info(`Job started: ${job.name} [${job.id}]`);
    });

    worker.on("completed", (job, result) => {
        logger.info(`Job completed: ${job.name} [${job.id}] - Lesson: ${result?.lessonId}`);
    });

    worker.on("failed", (job, err) => {
        logger.error(`Job failed: ${job?.name} [${job?.id}] - ${err?.message}`);
    });

    worker.on("error", (err) => {
        logger.error(`Worker error: ${err.message}`);
    });

    logger.info(`Transcode worker initialized, listening on queue: ${VIDEO_TRANSCODE_QUEUE}`);

    return worker;
}
