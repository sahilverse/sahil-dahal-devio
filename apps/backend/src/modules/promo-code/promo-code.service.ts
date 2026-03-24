import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PromoCodeRepository } from "./promo-code.repository";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { PaymentType } from "../../generated/prisma/client";

@injectable()
export class PromoCodeService {
    constructor(
        @inject(TYPES.PromoCodeRepository) private promoCodeRepository: PromoCodeRepository
    ) { }

    async validatePromoCode(code: string, applicableType?: PaymentType, packageId?: string, courseId?: string) {
        const promo = await this.promoCodeRepository.findPromoCode(code);
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
            discount: Number(promo.discount)
        };
    }

    async incrementUsage(id: string) {
        return this.promoCodeRepository.incrementPromoCodeUsage(id);
    }
}
