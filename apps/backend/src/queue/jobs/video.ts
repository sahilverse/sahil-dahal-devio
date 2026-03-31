import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { QueueService } from "../queue.service";

export const VIDEO_TRANSCODE_QUEUE = "video-transcode";
export const VIDEO_TRANSCODE_JOB = "transcode-video";

export interface VideoTranscodePayload {
    lessonId: string;
    rawVideoKey: string;
}

@injectable()
export class VideoJobService {
    constructor(@inject(TYPES.QueueService) private queueService: QueueService) { }

    async addTranscodeJob(lessonId: string, rawVideoKey: string) {
        const payload: VideoTranscodePayload = { lessonId, rawVideoKey };

        await this.queueService.addJob(
            VIDEO_TRANSCODE_QUEUE,
            VIDEO_TRANSCODE_JOB,
            payload,
            {
                jobId: lessonId,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 10000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    }
}
