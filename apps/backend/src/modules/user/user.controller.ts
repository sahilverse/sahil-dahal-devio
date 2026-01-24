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
}
