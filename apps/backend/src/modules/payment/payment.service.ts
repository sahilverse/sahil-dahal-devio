import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PaymentRepository } from "./payment.repository";
import { CipherService } from "../cipher/cipher.service";
import { NotificationService } from "../notification/notification.service";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { PaymentStatus, PaymentType, PaymentProvider, CipherReason, NotificationType } from "../../generated/prisma/client";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
    ESEWA_SECRET_KEY,
    ESEWA_PRODUCT_CODE,
    ESEWA_GATEWAY_URL,
    CLIENT_URL
} from "../../config/constants";


@injectable()
export class PaymentService {
    constructor(
        @inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService
    ) { }

    // ─── Initiate Payment ──────────────────────────────────────
    async initiatePayment(userId: string, packageId: string, promoCode?: string) {
        const pkg = await this.paymentRepository.findPackageById(packageId);
        if (!pkg) {
            throw new ApiError("Package not found or is inactive", StatusCodes.NOT_FOUND);
        }

        let totalAmount = Number(pkg.price);
        let discountAmount = 0;
        let promoCodeId: string | undefined;

        // Apply promo code if provided
        if (promoCode) {
            const promo = await this.validatePromoCode(promoCode, PaymentType.CIPHER_PURCHASE, packageId);
            discountAmount = Number(((totalAmount * promo.discount) / 100).toFixed(2));
            promoCodeId = promo.id;
        }

        const cashAmount = Number((totalAmount - discountAmount).toFixed(2));
        const transactionUuid = uuidv4();

        // Create PENDING payment record
        const payment = await this.paymentRepository.createPayment({
            user: { connect: { id: userId } },
            type: PaymentType.CIPHER_PURCHASE,
            package: { connect: { id: packageId } },
            totalAmount,
            discountAmount,
            cashAmount,
            provider: PaymentProvider.ESEWA,
            status: PaymentStatus.PENDING,
            providerTxId: transactionUuid,
            ...(promoCodeId && { promoCode: { connect: { id: promoCodeId } } })
        });

        // Generate eSewa HMAC SHA256 signature
        const signature = this.generateEsewaSignature(cashAmount, transactionUuid);

        return {
            paymentId: payment.id,
            esewaConfig: {
                amount: cashAmount,
                tax_amount: 0,
                total_amount: cashAmount,
                transaction_uuid: transactionUuid,
                product_code: ESEWA_PRODUCT_CODE,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${CLIENT_URL}/payments/verify`,
                failure_url: `${CLIENT_URL}/payments/failed`,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature,
            },
            esewaGatewayUrl: ESEWA_GATEWAY_URL
        };
    }

    // ─── Verify Payment ────────────────────────────────────────
    async verifyPayment(encodedData: string) {
        const decodedData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
        const { transaction_uuid, total_amount, status, signature: receivedSignature } = decodedData;

        if (!transaction_uuid || !total_amount || !status) {
            throw new ApiError("Invalid payment response data", StatusCodes.BAD_REQUEST);
        }

        // Find the payment record
        const payment = await this.paymentRepository.findPaymentByTxId(transaction_uuid);
        if (!payment) {
            throw new ApiError("Payment record not found", StatusCodes.NOT_FOUND);
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new ApiError("Payment already verified", StatusCodes.CONFLICT);
        }

        // Verify signature integrity
        const expectedSignature = this.generateEsewaSignature(Number(total_amount), transaction_uuid);
        if (receivedSignature !== expectedSignature) {
            logger.error(`eSewa signature mismatch for txn ${transaction_uuid}`);
            await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
            throw new ApiError("Payment verification failed: signature mismatch", StatusCodes.BAD_REQUEST);
        }

        if (status !== "COMPLETE") {
            await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
            throw new ApiError("Payment was not completed", StatusCodes.BAD_REQUEST);
        }

        // Mark payment as COMPLETED
        await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.COMPLETED);

        // Award ciphers to the user
        if (payment.type === PaymentType.CIPHER_PURCHASE && payment.package) {
            await this.cipherService.awardCipher(
                payment.userId,
                payment.package.points,
                CipherReason.PURCHASE,
                payment.id
            );

            // Increment promo code usage if used
            if (payment.promoCodeId) {
                await this.paymentRepository.incrementPromoCodeUsage(payment.promoCodeId);
            }

            // Send real-time notification
            await this.notificationService.notify({
                userId: payment.userId,
                type: NotificationType.SYSTEM,
                title: "Payment Successful! 🎉",
                message: `You received ${payment.package.points} Ciphers from your ${payment.package.name} purchase.`,
                actionUrl: "/payments/history"
            });

            logger.info(`Awarded ${payment.package.points} ciphers to user ${payment.userId} for payment ${payment.id}`);
        }

        return {
            paymentId: payment.id,
            status: "COMPLETED",
            ciphersAwarded: payment.package?.points || 0
        };
    }

    // ─── Get Packages ──────────────────────────────────────────
    async getPackages() {
        return this.paymentRepository.findActivePackages();
    }

    // ─── Get Payment History ───────────────────────────────────
    async getPaymentHistory(userId: string, limit: number, offset: number) {
        return this.paymentRepository.getUserPayments(userId, limit, offset);
    }

    // ─── Validate Promo Code ───────────────────────────────────
    async validatePromoCode(code: string, applicableType?: PaymentType, packageId?: string, courseId?: string) {
        const promo = await this.paymentRepository.findPromoCode(code);
        if (!promo) {
            throw new ApiError("Invalid or expired promo code", StatusCodes.NOT_FOUND);
        }

        const now = new Date();
        if (promo.validFrom && now < promo.validFrom) {
            throw new ApiError("Promo code is not yet active", StatusCodes.BAD_REQUEST);
        }
        if (promo.validUntil && now > promo.validUntil) {
            throw new ApiError("Promo code has expired", StatusCodes.BAD_REQUEST);
        }
        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
            throw new ApiError("Promo code usage limit reached", StatusCodes.BAD_REQUEST);
        }
        if (applicableType && promo.applicableType && promo.applicableType !== applicableType) {
            throw new ApiError(`Promo code is not applicable for ${applicableType}`, StatusCodes.BAD_REQUEST);
        }
        if (packageId && promo.applicablePackageId && promo.applicablePackageId !== packageId) {
            throw new ApiError(`Promo code is strictly applicable for a different package`, StatusCodes.BAD_REQUEST);
        }
        if (courseId && promo.applicableCourseId && promo.applicableCourseId !== courseId) {
            throw new ApiError(`Promo code is strictly applicable for a different course`, StatusCodes.BAD_REQUEST);
        }

        return {
            id: promo.id,
            code: promo.code,
            discount: Number(promo.discount),
            maxUses: promo.maxUses,
            usedCount: promo.usedCount,
            applicableType: promo.applicableType,
            applicablePackageId: promo.applicablePackageId,
            applicableCourseId: promo.applicableCourseId
        };
    }

    // ─── eSewa Signature Helper ────────────────────────────────
    private generateEsewaSignature(totalAmount: number, transactionUuid: string): string {
        const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
        hmac.update(message);
        return hmac.digest("base64");
    }
}
