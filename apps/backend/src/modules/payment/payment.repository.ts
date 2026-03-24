import { injectable, inject } from "inversify";
import { PrismaClient, PaymentStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { Prisma } from "../../generated/prisma/client";

@injectable()
export class PaymentRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createPayment(data: Prisma.PaymentCreateInput) {
        return this.prisma.payment.create({ data });
    }

    async findPaymentById(id: string) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: { package: true }
        });
    }

    async findPaymentByTxId(providerTxId: string) {
        return this.prisma.payment.findUnique({
            where: { providerTxId },
            include: { package: true, user: true }
        });
    }

    async updatePaymentStatus(id: string, status: PaymentStatus, providerTxId?: string) {
        return this.prisma.payment.update({
            where: { id },
            data: {
                status,
                ...(providerTxId && { providerTxId })
            }
        });
    }

    async findPackageById(packageId: string) {
        return this.prisma.cipherPackage.findUnique({
            where: { id: packageId, isActive: true }
        });
    }

    async findActivePackages() {
        return this.prisma.cipherPackage.findMany({
            where: { isActive: true },
            orderBy: { price: "asc" }
        });
    }

    async findPromoCode(code: string) {
        return this.prisma.promoCode.findUnique({
            where: { code, isActive: true }
        });
    }

    async incrementPromoCodeUsage(promoCodeId: string) {
        return this.prisma.promoCode.update({
            where: { id: promoCodeId },
            data: { usedCount: { increment: 1 } }
        });
    }

    async getUserPayments(userId: string, limit: number = 20, offset: number = 0) {
        return this.prisma.payment.findMany({
            where: { userId },
            include: { package: true },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset
        });
    }
}
