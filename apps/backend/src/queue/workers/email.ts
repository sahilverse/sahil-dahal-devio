import { injectable, inject } from "inversify";
import { Worker, Job } from "bullmq";
import { TYPES } from "../../types";
import { MailService } from "../../modules/mail";
import { RedisManager } from "../../config";
import { logger } from "../../utils/logger";
import { EMAIL_JOB_TYPES, EmailJobType } from "../../config/constants";

export interface EmailPayload {
    email: string;
    code: string;
    link: string;
}

@injectable()
export class EmailWorkerService {
    private workers: Map<EmailJobType, Worker> = new Map();

    constructor(
        @inject(TYPES.MailService) private mailService: MailService,
        @inject(TYPES.RedisManager) private redisManager: RedisManager
    ) { }

    async registerWorker(type: EmailJobType): Promise<void> {
        if (this.workers.has(type)) return;

        let queueName: string;
        let processor: (job: Job<EmailPayload>) => Promise<void>;

        switch (type) {
            case EMAIL_JOB_TYPES.VERIFICATION:
                queueName = "email_verification";
                processor = async (job) => {
                    const { email, code, link } = job.data;
                    await this.mailService.sendEmailVerificationEmail(email, code, link);
                };
                break;

            case EMAIL_JOB_TYPES.PASSWORD_RESET:
                queueName = "password_reset";
                processor = async (job) => {
                    const { email, code, link } = job.data;
                    await this.mailService.sendPasswordResetEmail(email, code, link);
                };
                break;

            default:
                throw new Error(`Unknown email job type: ${type}`);
        }

        const worker = new Worker(queueName, processor, {
            connection: this.redisManager.getPub(),
        });

        worker.on("completed", (job) => {
            logger.info(`Job completed: ${job.name} in queue ${queueName}`);
        });

        worker.on("failed", (job, err) => {
            logger.error(`Job failed: ${job?.name} in queue ${queueName} - ${err?.message}`);
        });

        worker.on("error", (err) => {
            logger.error(`Worker error in queue ${queueName}: ${err.message}`);
        });

        logger.info(`Worker initialized for queue: ${queueName}`);

        this.workers.set(type, worker);
    }

    async registerAllWorkers(): Promise<void> {
        await Promise.all(Object.values(EMAIL_JOB_TYPES).map((type) => this.registerWorker(type)));
    }
}
