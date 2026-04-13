import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { EmailJobService } from "./email";
import { TYPES } from "../../types";

describe("EmailJobService Unit Tests", () => {
    let container: Container;
    let emailJobService: EmailJobService;
    let mockQueueService: any;

    const MOCK_PAYLOAD = {
        email: "test@devio.com",
        code: "123456",
        link: "http://devio.com/verify",
    };

    beforeEach(() => {
        container = new Container();

        mockQueueService = {
            addJob: vi.fn().mockResolvedValue(undefined),
        };

        container.bind(TYPES.QueueService).toConstantValue(mockQueueService);
        container.bind(EmailJobService).to(EmailJobService);

        emailJobService = container.get(EmailJobService);
        vi.clearAllMocks();
    });

    describe("sendVerification()", () => {
        it("should route verification emails to the 'email_verification' queue", async () => {
            await emailJobService.sendVerification(MOCK_PAYLOAD.email, MOCK_PAYLOAD.code, MOCK_PAYLOAD.link);

            expect(mockQueueService.addJob).toHaveBeenCalledWith(
                "email_verification",
                "send_email_verification",
                MOCK_PAYLOAD
            );
        });
    });

    describe("sendPasswordReset()", () => {
        it("should route password reset emails to the 'password_reset' queue", async () => {
            await emailJobService.sendPasswordReset(MOCK_PAYLOAD.email, MOCK_PAYLOAD.code, MOCK_PAYLOAD.link);

            expect(mockQueueService.addJob).toHaveBeenCalledWith(
                "password_reset",
                "send_password_reset",
                MOCK_PAYLOAD
            );
        });
    });

    describe("General send()", () => {
        it("should throw an error for unsupported job types", async () => {
            await expect(emailJobService.send("UNKNOWN_TYPE" as any, MOCK_PAYLOAD))
                .rejects.toThrow("Unknown email job type");
        });
    });
});
