import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../types";
import { PaymentService } from "./payment.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class PaymentController {
    constructor(@inject(TYPES.PaymentService) private paymentService: PaymentService) { }

    initiatePurchase = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { packageId, promoCode } = req.body;

        const result = await this.paymentService.initiatePayment(userId, packageId, promoCode);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Payment initiated successfully", result);
    });

    verifyPayment = asyncHandler(async (req: Request, res: Response) => {
        const encodedData = req.query.data as string;
        if (!encodedData) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Missing payment data");
        }

        const result = await this.paymentService.verifyPayment(encodedData);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Payment verified successfully", result);
    });

    getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const limit = Number(req.query.limit) || 20;
        const cursor = req.query.cursor as string;

        const payments = await this.paymentService.getPaymentHistory(userId, limit, cursor);
        const lastItem = payments[payments.length - 1];
        const nextCursor = (payments.length === limit && lastItem) ? lastItem.id : null;

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Payment history fetched successfully", { 
            payments,
            nextCursor 
        });
    });
}

