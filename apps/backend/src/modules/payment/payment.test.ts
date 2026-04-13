import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service";
import { TYPES } from "../../types";
import { PaymentStatus, PaymentType, PaymentProvider, CipherReason } from "../../generated/prisma/client";

/**
 * TEST DATA CONSTANTS
 */
const MOCK_USER_ID = "user_123";
const MOCK_PACKAGE_ID = "pkg_pro";
const MOCK_COURSE_ID = "course_rust";
const MOCK_IP = "127.0.0.1";
const MOCK_USER_AGENT = "Mozilla/5.0...";
const MOCK_GATEWAY_URL = "https://uat.esewa.com.np/epay/main";

const MOCK_PACKAGE = {
    id: MOCK_PACKAGE_ID,
    name: "Pro Plan",
    price: 10.00,
    points: 500,
};

const MOCK_COURSE = {
    id: MOCK_COURSE_ID,
    title: "Rust for Devs",
    slug: "rust-for-devs",
    price: 50.00,
    isFree: false,
    maxCipherDiscount: 20.00,
};

describe("PaymentService Unit Tests", () => {
    let container: Container;
    let paymentService: PaymentService;

    // Mocks
    let mockPaymentRepo: any;
    let mockCipherService: any;
    let mockNotificationService: any;
    let mockMailService: any;
    let mockPromoCodeService: any;
    let mockCourseRepo: any;
    let mockEsewaGateway: any;

    beforeEach(() => {
        container = new Container();

        mockPaymentRepo = {
            createPayment: vi.fn(),
            findPaymentByTxId: vi.fn(),
            updatePaymentStatus: vi.fn(),
            getUserPayments: vi.fn(),
        };

        mockCipherService = {
            getPackageById: vi.fn().mockResolvedValue(MOCK_PACKAGE),
            awardCipher: vi.fn(),
            spendCipher: vi.fn(),
        };

        mockNotificationService = { notify: vi.fn() };
        mockMailService = { sendPaymentReceiptEmail: vi.fn().mockResolvedValue(undefined) };

        mockPromoCodeService = {
            validatePromoCode: vi.fn(),
            incrementUsage: vi.fn(),
        };

        mockCourseRepo = {
            findById: vi.fn().mockResolvedValue(MOCK_COURSE),
            findEnrollment: vi.fn().mockResolvedValue(null),
            createEnrollment: vi.fn(),
        };

        mockEsewaGateway = {
            provider: PaymentProvider.ESEWA,
            initiate: vi.fn().mockReturnValue({ gatewayConfig: {}, gatewayUrl: MOCK_GATEWAY_URL }),
            verify: vi.fn(),
        };

        // DI Setup
        container.bind(TYPES.PaymentRepository).toConstantValue(mockPaymentRepo);
        container.bind(TYPES.CipherService).toConstantValue(mockCipherService);
        container.bind(TYPES.NotificationService).toConstantValue(mockNotificationService);
        container.bind(TYPES.MailService).toConstantValue(mockMailService);
        container.bind(TYPES.PromoCodeService).toConstantValue(mockPromoCodeService);
        container.bind(TYPES.CourseRepository).toConstantValue(mockCourseRepo);
        container.bind(TYPES.EsewaGateway).toConstantValue(mockEsewaGateway);
        container.bind(PaymentService).to(PaymentService);

        paymentService = container.get(PaymentService);
        vi.clearAllMocks();
    });

    describe("initiatePayment (Cipher Purchase)", () => {
        it("should successfully initiate a cipher purchase and create a pending record", async () => {
            mockPaymentRepo.createPayment.mockResolvedValue({ id: "pay_1" });

            const result = await paymentService.initiatePayment(
                MOCK_USER_ID, MOCK_PACKAGE_ID, PaymentProvider.ESEWA, undefined, MOCK_IP, MOCK_USER_AGENT
            );

            expect(mockCipherService.getPackageById).toHaveBeenCalledWith(MOCK_PACKAGE_ID);
            expect(mockPaymentRepo.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                totalAmount: 10.00,
                status: PaymentStatus.PENDING,
                provider: PaymentProvider.ESEWA
            }));
            expect(result.gatewayUrl).toBe(MOCK_GATEWAY_URL);
        });

        it("should apply promo code discount correctly", async () => {
            mockPromoCodeService.validatePromoCode.mockResolvedValue({ id: "promo_1", discount: 20 });
            mockPaymentRepo.createPayment.mockResolvedValue({ id: "pay_2" });

            await paymentService.initiatePayment(
                MOCK_USER_ID, MOCK_PACKAGE_ID, PaymentProvider.ESEWA, "SAVE20"
            );

            expect(mockPaymentRepo.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                totalAmount: 8.00, // 10.00 - 20%
                discountAmount: 2.00
            }));
        });
    });

    describe("initiateCoursePayment", () => {
        it("should throw error if user is already enrolled", async () => {
            mockCourseRepo.findEnrollment.mockResolvedValue({ id: "enr_1" });

            await expect(paymentService.initiateCoursePayment(MOCK_USER_ID, MOCK_COURSE_ID, PaymentProvider.ESEWA))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.CONFLICT }));
        });

        it("should allow partial payment using cipher coins", async () => {
            mockPaymentRepo.createPayment.mockResolvedValue({ id: "pay_3" });

            await paymentService.initiateCoursePayment(
                MOCK_USER_ID, MOCK_COURSE_ID, PaymentProvider.ESEWA, undefined, 15.00
            );

            expect(mockPaymentRepo.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                totalAmount: 35.00, // 50.00 - 15.00
                metadata: { cipherSpent: 15.00 }
            }));
        });

        it("should directly enroll if total amount becomes zero after discounts", async () => {
            mockPromoCodeService.validatePromoCode.mockResolvedValue({ id: "promo_free", discount: 100 });

            const result = await paymentService.initiateCoursePayment(
                MOCK_USER_ID, MOCK_COURSE_ID, PaymentProvider.ESEWA, "FREEALL"
            );

            expect(result.enrolled).toBe(true);
            expect(mockCourseRepo.createEnrollment).toHaveBeenCalledWith(MOCK_USER_ID, MOCK_COURSE_ID);
            expect(mockPaymentRepo.createPayment).not.toHaveBeenCalled();
            expect(mockNotificationService.notify).toHaveBeenCalled();
        });
    });

    describe("verifyPayment", () => {
        const mockVerifiedPayment = {
            id: "pay_verified",
            userId: MOCK_USER_ID,
            type: PaymentType.CIPHER_PURCHASE,
            status: PaymentStatus.PENDING,
            totalAmount: 10.00,
            currency: "NPR",
            package: MOCK_PACKAGE,
            user: { email: "sahil@devio.com", username: "sahil", firstName: "Sahil" },
            providerTxId: "tx_123"
        };

        it("should successfully verify eSewa payment and award ciphers", async () => {
            mockEsewaGateway.verify.mockResolvedValue({
                success: true,
                providerRefId: "REF_001",
                rawResponse: { transaction_uuid: "tx_123" }
            });
            mockPaymentRepo.findPaymentByTxId.mockResolvedValue(mockVerifiedPayment);

            const result = await paymentService.verifyPayment(PaymentProvider.ESEWA, "encoded_data");

            expect(mockPaymentRepo.updatePaymentStatus).toHaveBeenCalledWith(
                "pay_verified",
                PaymentStatus.COMPLETED,
                expect.any(Object)
            );
            expect(mockCipherService.awardCipher).toHaveBeenCalledWith(
                MOCK_USER_ID, 500, CipherReason.PURCHASE, "pay_verified"
            );
            expect(mockMailService.sendPaymentReceiptEmail).toHaveBeenCalled();
            expect(result.status).toBe("COMPLETED");
        });

        it("should update status to FAILED if gateway verification fails", async () => {
            mockEsewaGateway.verify.mockResolvedValue({
                success: false,
                failureReason: "Signature Mismatch",
                rawResponse: { transaction_uuid: "tx_123" }
            });
            mockPaymentRepo.findPaymentByTxId.mockResolvedValue(mockVerifiedPayment);

            await expect(paymentService.verifyPayment(PaymentProvider.ESEWA, "bad_data"))
                .rejects.toThrow("Payment verification failed: Signature Mismatch");

            expect(mockPaymentRepo.updatePaymentStatus).toHaveBeenCalledWith(
                "pay_verified",
                PaymentStatus.FAILED,
                expect.objectContaining({ failureReason: "Signature Mismatch" })
            );
        });

        it("should throw error if payment is already COMPLETED", async () => {
            mockEsewaGateway.verify.mockResolvedValue({
                success: true,
                rawResponse: { transaction_uuid: "tx_123" }
            });
            mockPaymentRepo.findPaymentByTxId.mockResolvedValue({
                ...mockVerifiedPayment,
                status: PaymentStatus.COMPLETED
            });

            await expect(paymentService.verifyPayment(PaymentProvider.ESEWA, "data"))
                .rejects.toThrow(expect.objectContaining({ statusCode: StatusCodes.CONFLICT }));
        });
    });
});
