import { injectable, inject } from "inversify";
import { Worker, Job } from "bullmq";
import { TYPES } from "../../types";
import { LabRepository } from "./lab.repository";
import { LabVMService } from "./lab-vm.service";
import { RedisManager } from "../../config";
import { QueueService } from "../../queue";
import { logger } from "../../utils/logger";

@injectable()
export class LabVMWorkerService {
    private worker: Worker | null = null;
    private readonly QUEUE_NAME = "lab_vm_termination";

    constructor(
        @inject(TYPES.LabRepository) private labRepository: LabRepository,
        @inject(TYPES.LabVMService) private labVMService: LabVMService,
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.QueueService) private queueService: QueueService
    ) { }

    async init(): Promise<void> {
        await this.queueService.addJob(this.QUEUE_NAME, "check_expired_sessions", {}, {
            repeat: { pattern: "* * * * *" } // Every minute
        });

        this.worker = new Worker(this.QUEUE_NAME, async (job: Job) => {
            if (job.name === "check_expired_sessions") {
                await this.processExpirations();
            }
        }, {
            connection: this.redisManager.getPub().duplicate(),
        });

        this.worker.on("completed", (job) => {
            if (job.name === "check_expired_sessions") {
            }
        });

        this.worker.on("failed", (job, err) => {
            logger.error(`Lab VM Worker Job failed: ${job?.id} - ${err.message}`);
        });

        logger.info(`Lab VM Worker initialized with 1-minute expiration check.`);
    }

    private async processExpirations(): Promise<void> {
        const expiredSessions = await this.labRepository.findExpiredRunningSessions();

        if (expiredSessions.length > 0) {
            logger.info(`Found ${expiredSessions.length} expired lab sessions. Starting auto-termination...`);

            for (const session of expiredSessions) {
                try {
                    await this.labVMService.terminateSession(session.id, session.userId);
                    logger.info(`Auto-terminated expired session ${session.id} for user ${session.userId}`);
                } catch (error: any) {
                    logger.error(`Failed to auto-terminate session ${session.id}: ${error.message}`);
                }
            }
        }
    }
}
