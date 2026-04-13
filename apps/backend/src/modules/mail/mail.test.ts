import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { MailService } from "./mail.service";
import { TYPES } from "../../types";
import fs from "fs";

vi.mock("fs", () => ({
    default: {
        readFileSync: vi.fn(),
    },
}));

describe("MailService Unit Tests", () => {
    let container: Container;
    let mailService: MailService;
    let mockTransporter: any;

    const MOCK_EMAIL = "user@test.com";

    beforeEach(() => {
        container = new Container();

        mockTransporter = {
            sendMail: vi.fn().mockResolvedValue({ messageId: "123" }),
        };

        container.bind(TYPES.Transporter).toConstantValue(mockTransporter);
        container.bind(MailService).to(MailService);

        mailService = container.get(MailService);
        vi.clearAllMocks();
    });

    describe("sendPasswordResetEmail()", () => {
        it("should load the correct template and replace password reset placeholders", async () => {
            const mockTemplate = "Reset your password with {{RESET_TOKEN}} at {{RESET_LINK}}";
            (fs.readFileSync as any).mockReturnValue(mockTemplate);

            const resetToken = "token123";
            const resetLink = "http://devio.com/reset";

            await mailService.sendPasswordResetEmail(MOCK_EMAIL, resetToken, resetLink);

            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("reset-password.html"), "utf-8");
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: MOCK_EMAIL,
                subject: "Devio Password Reset",
                html: "Reset your password with token123 at http://devio.com/reset",
            }));
        });
    });

    describe("sendEmailVerificationEmail()", () => {
        it("should load the correct template and replace verification placeholders", async () => {
            const mockTemplate = "Your code is {{VERIFICATION_CODE}} and link is {{VERIFICATION_LINK}}";
            (fs.readFileSync as any).mockReturnValue(mockTemplate);

            const code = "654321";
            const link = "http://devio.com/verify";

            await mailService.sendEmailVerificationEmail(MOCK_EMAIL, code, link);

            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("email-verification.html"), "utf-8");
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                subject: "Devio Email Verification",
                html: "Your code is 654321 and link is http://devio.com/verify",
            }));
        });
    });

    describe("sendPaymentReceiptEmail()", () => {
        it("should correctly replace all complex placeholders in the payment receipt", async () => {
            const mockTemplate = "Hi {{USER_NAME}}, you paid {{AMOUNT}} {{CURRENCY}} for {{PACKAGE_NAME}} on {{DATE}}. TXN: {{TRANSACTION_ID}}";
            (fs.readFileSync as any).mockReturnValue(mockTemplate);

            const paymentData = {
                userName: "Sahil",
                transactionId: "TXN_999",
                date: "2024-04-13",
                packageName: "Pro Plan",
                ciphers: "500",
                amount: "10.00",
                currency: "USD",
                dashboardUrl: "http://devio.com/dash",
            };

            await mailService.sendPaymentReceiptEmail(MOCK_EMAIL, paymentData);

            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("payment-receipt.html"), "utf-8");
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                html: expect.stringContaining("Sahil"),
            }));
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                html: expect.stringContaining("10.00 USD"),
            }));
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
                html: expect.stringContaining("TXN_999"),
            }));
        });
    });

    describe("Error Handling", () => {
        it("should propagate errors if the transporter fails to send", async () => {
            (fs.readFileSync as any).mockReturnValue("Template");
            mockTransporter.sendMail.mockRejectedValue(new Error("SMTP Failure"));

            await expect(mailService.sendPasswordResetEmail(MOCK_EMAIL, "t", "l"))
                .rejects.toThrow("SMTP Failure");
        });
    });
});
