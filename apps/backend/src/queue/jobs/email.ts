import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { QueueService } from "../queue.service";
import { EMAIL_JOB_TYPES, EmailJobType } from "../../config/constants";

export interface EmailJobPayload {
    email: string;
    code: string;
    link: string;
}

@injectable()
export class EmailJobService {
    constructor(@inject(TYPES.QueueService) private queueService: QueueService) { }

    async send(type: EmailJobType, payload: EmailJobPayload) {
        let jobName: string;
        let queueName: string;

        switch (type) {
            case EMAIL_JOB_TYPES.VERIFICATION:
                jobName = "send_email_verification";
                queueName = "email_verification";
                break;
            case EMAIL_JOB_TYPES.PASSWORD_RESET:
                jobName = "send_password_reset";
                queueName = "password_reset";
                break;
            default:
                throw new Error(`Unknown email job type: ${type}`);
        }

        await this.queueService.addJob(queueName, jobName, payload);
    }

    async sendVerification(email: string, code: string, link: string) {
        await this.send(EMAIL_JOB_TYPES.VERIFICATION, { email, code, link });
    }

    async sendPasswordReset(email: string, code: string, link: string) {
        await this.send(EMAIL_JOB_TYPES.PASSWORD_RESET, { email, code, link });
    }
}
