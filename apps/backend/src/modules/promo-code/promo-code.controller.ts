import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { PromoCodeService } from "./promo-code.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { PaymentType } from "../../generated/prisma/client";
import { StatusCodes } from "http-status-codes";

@injectable()
export class PromoCodeController {
    constructor(
        @inject(TYPES.PromoCodeService) private promoCodeService: PromoCodeService
    ) { }

    validatePromoCode = asyncHandler(async (req: Request, res: Response) => {
        const { code, type, packageId, courseId } = req.body;
        const result = await this.promoCodeService.validatePromoCode(
            code,
            type as PaymentType,
            packageId,
            courseId
        );
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Promo code validated successfully", result);
    });
}
