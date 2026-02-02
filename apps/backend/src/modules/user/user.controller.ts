import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { UserService } from "./user.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { toAuthUserDTO } from "../auth";

@injectable()
export class UserController {
    constructor(@inject(TYPES.UserService) private userService: UserService) { }

    completeOnboarding = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { username, firstName, lastName } = req.body;

        const updatedUser = await this.userService.completeOnboarding(userId, {
            username,
            firstName,
            lastName,
        });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Profile completed successfully", toAuthUserDTO(updatedUser));
    });

    getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const viewerId = req.user?.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        const profile = await this.userService.getProfile(username, viewerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Profile fetched successfully", profile);
    });

    followUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const followerId = req.user!.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        await this.userService.followUser(username, followerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Followed successfully");
    });

    unfollowUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username } = req.params as { username: string };
        const followerId = req.user!.id;

        if (!username) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Username is required");
        }

        await this.userService.unfollowUser(username, followerId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Unfollowed successfully");
    });
}
