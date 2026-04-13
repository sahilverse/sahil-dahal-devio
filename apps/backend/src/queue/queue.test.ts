import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { QueueService } from "./queue.service";
import { TYPES } from "../types";
import { Queue } from "bullmq";

// Mock BullMQ completely
const mockAdd = vi.fn().mockResolvedValue({ id: "job_123" });

vi.mock("bullmq", () => {
    return {
        Queue: vi.fn().mockImplementation(function (this: any, name: string, options: any) {
            this.name = name;
            this.options = options;
            this.add = mockAdd;
            return this;
        }),
    };
});

describe("QueueService Unit Tests", () => {
    let container: Container;
    let queueService: QueueService;
    let mockRedisManager: any;

    beforeEach(() => {
        container = new Container();

        mockRedisManager = {
            getPub: vi.fn().mockReturnValue({}),
        };

        container.bind(TYPES.RedisManager).toConstantValue(mockRedisManager);
        container.bind(QueueService).to(QueueService);

        queueService = container.get(QueueService);
        vi.clearAllMocks();
    });

    describe("createQueue()", () => {
        it("should initialize a BullMQ Queue with correct retry and backoff strategies", () => {
            const queueName = "test_queue";
            const queue = queueService.createQueue(queueName);

            expect(Queue).toHaveBeenCalledWith(queueName, expect.objectContaining({
                defaultJobOptions: expect.objectContaining({
                    attempts: 5,
                    backoff: expect.objectContaining({
                        type: "exponential",
                        delay: 5000,
                    }),
                }),
            }));
            expect(queue.name).toBe(queueName);
        });

        it("should maintain a singleton instance for each queue name", () => {
            const name = "singleton_queue";
            const q1 = queueService.createQueue(name);
            const q2 = queueService.createQueue(name);

            expect(q1).toBe(q2);
            expect(Queue).toHaveBeenCalledTimes(1);
        });
    });

    describe("addJob()", () => {
        it("should correctly delegate job addition to the underlying queue", async () => {
            const queueName = "email_queue";
            const jobName = "send_welcome";
            const data = { email: "test@devio.com" };

            await queueService.addJob(queueName, jobName, data);

            expect(mockAdd).toHaveBeenCalledWith(jobName, data, undefined);
        });
    });
});
