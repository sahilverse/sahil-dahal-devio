import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PaymentRepository } from "./payment.repository";
import { CipherService } from "../cipher/cipher.service";
import { NotificationService } from "../notification/notification.service";
import { MailService } from "../mail/mail.service";
import { PromoCodeService } from "../promo-code/promo-code.service";
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


//TODO: FIX Payment Service. 


@injectable()
export class PaymentService {
    constructor(
        @inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.MailService) private mailService: MailService,
        @inject(TYPES.PromoCodeService) private promoCodeService: PromoCodeService
    ) { }

    // ─── Initiate Payment ──────────────────────────────────────
    async initiatePayment(userId: string, packageId: string, promoCode?: string, ipAddress?: string, userAgent?: string) {
        const pkg = await this.cipherService.getPackageById(packageId);

        const subtotal = Number(pkg.price);
        let discountAmount = 0;
        let promoCodeId: string | undefined;

        // Apply promo code if provided
        if (promoCode) {
            const promo = await this.promoCodeService.validatePromoCode(promoCode, PaymentType.CIPHER_PURCHASE, packageId);
            discountAmount = Number(((subtotal * promo.discount) / 100).toFixed(2));
            promoCodeId = promo.id;
        }

        const totalAmount = Number((subtotal - discountAmount).toFixed(2));
        const transactionUuid = uuidv4();

        // Create PENDING payment record
        const payment = await this.paymentRepository.createPayment({
            user: { connect: { id: userId } },
            type: PaymentType.CIPHER_PURCHASE,
            package: { connect: { id: packageId } },
            subtotal,
            discountAmount,
            totalAmount,
            ipAddress,
            userAgent,
            provider: PaymentProvider.ESEWA,
            status: PaymentStatus.PENDING,
            providerTxId: transactionUuid,
            ...(promoCodeId && { promoCode: { connect: { id: promoCodeId } } })
        });

        // Generate eSewa HMAC SHA256 signature
        const signature = this.generateEsewaSignature(totalAmount, transactionUuid);

        return {
            paymentId: payment.id,
            esewaConfig: {
                amount: totalAmount,
                tax_amount: 0,
                total_amount: totalAmount,
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
        const { transaction_uuid, total_amount, status, ref_id, signature: receivedSignature } = decodedData;

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
            await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED, {
                failureReason: "eSewa signature mismatch"
            });
            throw new ApiError("Payment verification failed: signature mismatch", StatusCodes.BAD_REQUEST);
        }

        if (status !== "COMPLETE") {
            await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED, {
                failureReason: `eSewa returned status: ${status}`
            });
            throw new ApiError("Payment was not completed", StatusCodes.BAD_REQUEST);
        }

        // Mark payment as COMPLETED
        await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.COMPLETED, {
            verifiedAt: new Date(),
            providerRefId: ref_id,
            metadata: decodedData
        });

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
                await this.promoCodeService.incrementUsage(payment.promoCodeId);
            }

            // Send real-time notification
            await this.notificationService.notify({
                userId: payment.userId,
                type: NotificationType.SYSTEM,
                title: "Payment Successful! 🎉",
                message: `You received ${payment.package.points} Ciphers from your ${payment.package.name} purchase.`,
                actionUrl: "/payments/history"
            });

            // Send email receipt
            try {
                const user = (payment as any).user;
                if (user && user.email) {
                    await this.mailService.sendPaymentReceiptEmail(user.email, {
                        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
                        transactionId: payment.providerTxId || payment.id,
                        date: new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        packageName: payment.package.name,
                        ciphers: payment.package.points.toString(),
                        amount: payment.totalAmount.toString(),
                        currency: payment.package.currency,
                        dashboardUrl: `${CLIENT_URL}/${user.username}`,
                    });
                    logger.info(`Payment receipt sent to ${user.email} for payment ${payment.id}`);
                }
            } catch (error: any) {
                logger.error(`Failed to send payment receipt: ${error.message}`);
            }
        }

        return {
            paymentId: payment.id,
            status: "COMPLETED",
            ciphersAwarded: payment.package?.points || 0
        };
    }

    // ─── Get Payment History ───────────────────────────────────
    async getPaymentHistory(userId: string, limit: number, cursor?: string) {
        return this.paymentRepository.getUserPayments(userId, limit, cursor);
    }

    // ─── eSewa Signature Helper ────────────────────────────────
    private generateEsewaSignature(totalAmount: number, transactionUuid: string): string {
        const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const hash = crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
        return hash;
    }
}
