import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PaymentRepository } from "./payment.repository";
import { CipherService } from "../cipher/cipher.service";
import { NotificationService } from "../notification/notification.service";
import { MailService } from "../mail/mail.service";
import { PromoCodeService } from "../promo-code/promo-code.service";
import { CourseRepository } from "../course/course.repository";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { PaymentStatus, PaymentType, PaymentProvider, CipherReason, NotificationType, Prisma } from "../../generated/prisma/client";
import { v4 as uuidv4 } from "uuid";
import { CLIENT_URL } from "../../config/constants";
import type { IPaymentGateway } from "./gateways/payment-gateway.interface";

@injectable()
export class PaymentService {
    private gateways: Map<PaymentProvider, IPaymentGateway> = new Map();

    constructor(
        @inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.MailService) private mailService: MailService,
        @inject(TYPES.PromoCodeService) private promoCodeService: PromoCodeService,
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.EsewaGateway) esewaGateway: IPaymentGateway
    ) {
        this.registerGateway(esewaGateway);
    }

    private registerGateway(gateway: IPaymentGateway) {
        this.gateways.set(gateway.provider, gateway);
    }

    private getGateway(provider: PaymentProvider): IPaymentGateway {
        const gateway = this.gateways.get(provider);
        if (!gateway) {
            throw new ApiError(`Payment provider '${provider}' is not supported`, StatusCodes.BAD_REQUEST);
        }
        return gateway;
    }

    getSupportedProviders(): PaymentProvider[] {
        return Array.from(this.gateways.keys());
    }

    async initiatePayment(
        userId: string,
        packageId: string,
        provider: PaymentProvider,
        promoCode?: string,
        ipAddress?: string,
        userAgent?: string
    ) {
        const gateway = this.getGateway(provider);
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
            provider,
            status: PaymentStatus.PENDING,
            providerTxId: transactionUuid,
            ...(promoCodeId && { promoCode: { connect: { id: promoCodeId } } })
        });

        // Delegate gateway-specific initiation
        const { gatewayConfig, gatewayUrl } = gateway.initiate(totalAmount, transactionUuid);

        return {
            paymentId: payment.id,
            provider,
            gatewayConfig,
            gatewayUrl,
        };
    }

    async initiateCoursePayment(
        userId: string,
        courseId: string,
        provider: PaymentProvider,
        promoCode?: string,
        cipherAmount?: number,
        ipAddress?: string,
        userAgent?: string
    ) {
        const gateway = this.getGateway(provider);
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
        if (course.isFree) throw new ApiError("This course is free — no payment required", StatusCodes.BAD_REQUEST);

        // Check if already enrolled
        const existing = await this.courseRepository.findEnrollment(userId, courseId);
        if (existing) throw new ApiError("You are already enrolled in this course", StatusCodes.CONFLICT);

        const subtotal = Number(course.price);
        let discountAmount = 0;
        let promoCodeId: string | undefined;
        let cipherSpent = 0;

        // Apply promo code if provided
        if (promoCode) {
            const promo = await this.promoCodeService.validatePromoCode(promoCode, PaymentType.COURSE_PURCHASE, undefined, courseId);
            discountAmount = Number(((subtotal * promo.discount) / 100).toFixed(2));
            promoCodeId = promo.id;
        }

        // Apply cipher coin discount (elective)
        if (cipherAmount !== undefined && cipherAmount > 0) {
            const maxDiscount = course.maxCipherDiscount ?? subtotal;
            const afterPromo = subtotal - discountAmount;
            cipherSpent = Math.min(cipherAmount, maxDiscount, afterPromo);
            discountAmount += cipherSpent;
        }

        const totalAmount = Number((subtotal - discountAmount).toFixed(2));

        if (totalAmount <= 0) {
            // Fully covered by discounts — enroll directly
            if (cipherSpent > 0) {
                await this.cipherService.spendCipher(userId, cipherSpent, CipherReason.COURSE_DISCOUNT, courseId);
            }
            if (promoCodeId) {
                await this.promoCodeService.incrementUsage(promoCodeId);
            }
            await this.courseRepository.createEnrollment(userId, courseId);

            await this.notificationService.notify({
                userId,
                type: NotificationType.COURSE_ENROLLMENT,
                title: "Enrollment Successful! 🎓",
                message: `You have been enrolled in "${course.title}".`,
                actionUrl: `/courses/${course.slug}`,
            });

            return { enrolled: true, courseSlug: course.slug };
        }

        const transactionUuid = uuidv4();

        // Create PENDING payment record
        const payment = await this.paymentRepository.createPayment({
            user: { connect: { id: userId } },
            type: PaymentType.COURSE_PURCHASE,
            course: { connect: { id: courseId } },
            subtotal,
            discountAmount,
            totalAmount,
            ipAddress,
            userAgent,
            provider,
            status: PaymentStatus.PENDING,
            providerTxId: transactionUuid,
            metadata: cipherSpent > 0 ? { cipherSpent } as any : undefined,
            ...(promoCodeId && { promoCode: { connect: { id: promoCodeId } } })
        });

        const { gatewayConfig, gatewayUrl } = gateway.initiate(totalAmount, transactionUuid);

        return {
            enrolled: false,
            paymentId: payment.id,
            provider,
            gatewayConfig,
            gatewayUrl,
        };
    }

    async verifyPayment(provider: PaymentProvider, encodedData: string) {
        const gateway = this.getGateway(provider);

        // Delegate gateway-specific verification
        const result = await gateway.verify(encodedData);

        // Extract transaction_uuid from the raw response to find the payment
        const txId = this.extractTransactionId(provider, result.rawResponse);

        const payment = await this.paymentRepository.findPaymentByTxId(txId);
        if (!payment) {
            throw new ApiError("Payment record not found", StatusCodes.NOT_FOUND);
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new ApiError("Payment already verified", StatusCodes.CONFLICT);
        }

        if (!result.success) {
            logger.error(`Payment verification failed for txn ${txId}: ${result.failureReason}`);
            await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED, {
                failureReason: result.failureReason,
                metadata: result.rawResponse as Prisma.InputJsonValue,
            });
            throw new ApiError(`Payment verification failed: ${result.failureReason}`, StatusCodes.BAD_REQUEST);
        }

        // Mark payment as COMPLETED
        await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.COMPLETED, {
            verifiedAt: new Date(),
            providerRefId: result.providerRefId,
            metadata: result.rawResponse as Prisma.InputJsonValue,
        });

        // Post-payment processing (award ciphers, notifications, email)
        await this.processSuccessfulPayment(payment);

        return {
            paymentId: payment.id,
            status: "COMPLETED",
            ciphersAwarded: payment.package?.points || 0,
            type: payment.type,
            courseSlug: (payment as any).course?.slug,
        };
    }

    async getPaymentHistory(userId: string, limit: number, cursor?: string) {
        return this.paymentRepository.getUserPayments(userId, limit, cursor);
    }

    private extractTransactionId(provider: PaymentProvider, rawResponse: Record<string, unknown>): string {
        switch (provider) {
            case PaymentProvider.ESEWA:
                return rawResponse.transaction_uuid as string;
            case PaymentProvider.KHALTI:
                return rawResponse.pidx as string || rawResponse.transaction_id as string;
            default:
                throw new ApiError("Could not extract transaction ID from provider response", StatusCodes.BAD_REQUEST);
        }
    }

    private async processSuccessfulPayment(payment: Awaited<ReturnType<PaymentRepository["findPaymentByTxId"]>>) {
        if (!payment) return;

        // Increment promo code usage if used
        if (payment.promoCodeId) {
            await this.promoCodeService.incrementUsage(payment.promoCodeId);
        }

        if (payment.type === PaymentType.CIPHER_PURCHASE && payment.package) {
            await this.cipherService.awardCipher(
                payment.userId,
                payment.package.points,
                CipherReason.PURCHASE,
                payment.id
            );

            await this.notificationService.notify({
                userId: payment.userId,
                type: NotificationType.SYSTEM,
                title: "Payment Successful! 🎉",
                message: `You received ${payment.package.points} Ciphers from your ${payment.package.name} purchase.`,
                actionUrl: "/payments/history"
            });

            const user = (payment as any).user;
            if (user && user.email) {
                this.mailService.sendPaymentReceiptEmail(user.email, {
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
                    currency: payment.currency,
                    dashboardUrl: `${CLIENT_URL}/${user.username}`,
                }).then(() => {
                    logger.info(`Payment receipt sent to ${user.email} for payment ${payment.id}`);
                }).catch((error: any) => {
                    logger.error(`Failed to send payment receipt: ${error.message}`);
                });
            }
        }

        if (payment.type === PaymentType.COURSE_PURCHASE && payment.courseId) {
            // Spend cipher coins if metadata indicates it
            const metadata = payment.metadata as any;
            if (metadata?.cipherSpent && metadata.cipherSpent > 0) {
                await this.cipherService.spendCipher(
                    payment.userId,
                    metadata.cipherSpent,
                    CipherReason.COURSE_DISCOUNT,
                    payment.courseId
                );
            }

            // Create enrollment
            await this.courseRepository.createEnrollment(payment.userId, payment.courseId);

            const course = (payment as any).course;
            await this.notificationService.notify({
                userId: payment.userId,
                type: NotificationType.COURSE_ENROLLMENT,
                title: "Enrollment Successful! 🎓",
                message: `You have been enrolled in "${course?.title || 'your course'}". Start learning now!`,
                actionUrl: `/courses/${course?.slug || ''}`,
            });
        }
    }
}
