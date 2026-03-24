import { injectable, inject } from "inversify";
import { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class PromoCodeRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

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
}
