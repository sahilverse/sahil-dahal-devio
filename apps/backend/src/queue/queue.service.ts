import { inject, injectable } from "inversify";
import { Queue, QueueOptions } from "bullmq";
import { TYPES } from "../types";
import { RedisManager } from "../config";


@injectable()
export class QueueService {
    private queues: Map<string, Queue> = new Map();

    constructor(@inject(TYPES.RedisManager) private redisManager: RedisManager) { }

    createQueue(name: string, options?: Partial<QueueOptions>): Queue {
        if (!this.queues.has(name)) {
            const queue = new Queue(name, {
                connection: this.redisManager.getPub(),
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: "exponential",
                        delay: 5000
                    },
                    removeOnComplete: true,
                    removeOnFail: false
                },
                ...options,
            });
            this.queues.set(name, queue);
        }
        return this.queues.get(name)!;
    }

    async addJob(queueName: string, jobName: string, data: Record<string, any>) {
        const queue = this.createQueue(queueName);
        await queue.add(jobName, data);
    }
}
