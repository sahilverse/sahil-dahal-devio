import { injectable, inject } from "inversify";
import { QueueEvents } from "bullmq";
import { TYPES } from "../../types";
import { RedisManager } from "../../config";
import { LessonRepository } from "../../modules/course/lessons/lesson.repository";
import { logger } from "../../utils/logger";
import { VIDEO_TRANSCODE_QUEUE } from "../jobs/video";
import { VideoStatus } from "../../generated/prisma/enums";

@injectable()
export class VideoObserverService {
    private queueEvents?: QueueEvents;

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.LessonRepository) private lessonRepository: LessonRepository
    ) { }

    async init(): Promise<void> {
        if (this.queueEvents) return;

        this.queueEvents = new QueueEvents(VIDEO_TRANSCODE_QUEUE, {
            connection: this.redisManager.getPub().duplicate(),
        });

        this.queueEvents.on("completed", async ({ jobId, returnvalue }) => {
            const { masterPlaylistUrl } = returnvalue as unknown as { lessonId: string; masterPlaylistUrl: string };
            logger.info(`Video transcode completed for lesson: ${jobId}`);

            try {
                await this.lessonRepository.updateVideoStatus(jobId, VideoStatus.READY);
                await this.lessonRepository.update(jobId, {
                    videoUrl: masterPlaylistUrl,
                });
            } catch (err: any) {
                logger.error(`Failed to update lesson ${jobId} after transcode: ${err.message}`);
            }
        });

        this.queueEvents.on("failed", async ({ jobId, failedReason }) => {
            logger.error(`Video transcode failed for job ${jobId}: ${failedReason}`);

            try {
                await this.lessonRepository.updateVideoStatus(jobId, VideoStatus.FAILED);
            } catch (err: any) {
                logger.error(`Failed to update lesson status on transcode failure: ${err.message}`);
            }
        });

        logger.info(`Video transcode observer initialized on queue: ${VIDEO_TRANSCODE_QUEUE}`);
    }

    async stop(): Promise<void> {
        if (this.queueEvents) {
            await this.queueEvents.close();
            this.queueEvents = undefined;
        }
    }
}
