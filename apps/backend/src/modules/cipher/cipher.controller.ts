import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../types";
import { CipherService } from "./cipher.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class CipherController {
    constructor(@inject(TYPES.CipherService) private cipherService: CipherService) { }

    getBalance = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const balance = await this.cipherService.getBalance(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Balance fetched successfully", { balance });
    });

    getHistory = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const limit = Number(req.query.limit) || 20;
        const offset = Number(req.query.offset) || 0;

        const history = await this.cipherService.getHistory(userId, limit, offset);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "History fetched successfully", { history });
    });
}
