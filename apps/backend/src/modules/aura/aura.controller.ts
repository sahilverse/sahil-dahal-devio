import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { AuraService } from "./aura.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class AuraController {
    constructor(@inject(TYPES.AuraService) private auraService: AuraService) { }

    getPoints = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        if (!userId) {
            return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, "User not authenticated");
        }

        const points = await this.auraService.getPoints(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "User points fetched successfully", { points });
    });

    getHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        if (!userId) {
            return ResponseHandler.sendError(res, StatusCodes.UNAUTHORIZED, "User not authenticated");
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

        const history = await this.auraService.getHistory(userId, limit, offset);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Aura history fetched successfully", { history });
    });
}
