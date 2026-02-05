import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { ActivityService } from "./activity.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class ActivityController {
    constructor(@inject(TYPES.ActivityService) private activityService: ActivityService) { }

    getActivityByYear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params;
        const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

        if (isNaN(year)) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Year must be a valid number");
        }

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        const activityData = await this.activityService.getActivityByYear(username, year);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Activity data fetched successfully", activityData);
    });

    getAvailableYears = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        const years = await this.activityService.getAvailableYears(username);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Available years fetched successfully", { years });
    });
}
