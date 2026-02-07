
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CommunityService } from "./community.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { CreateCommunityInput } from "@devio/zod-utils";

@injectable()
export class CommunityController {
    constructor(@inject(TYPES.CommunityService) private communityService: CommunityService) { }

    createCommunity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const data = req.body as CreateCommunityInput;

        const community = await this.communityService.createCommunity(userId, data);

        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Community created successfully", community);
    });

    getCommunityByName = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        const userId = req.user?.id;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }
        const community = await this.communityService.getCommunityByName(name, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Community fetched successfully", community);
    });

    getModerators = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        const { limit, cursor } = req.query;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const limitNum = limit ? parseInt(limit as string) : 10;
        const cursorStr = cursor ? cursor as string : undefined;

        const result = await this.communityService.getCommunityModerators(name, limitNum, cursorStr);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Moderators fetched successfully", result);
    });
}
