import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../utils";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils";
import { JWT_REFRESH_EXPIRATION_DAYS } from "../../config/constants";
import { StatusCodes } from "http-status-codes";



@injectable()
export class AuthController {
    constructor(@inject(TYPES.AuthService) private authService: AuthService) { }


    register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const registerPayload = req.body;
        await this.authService.registerUser(registerPayload);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "User registered successfully");
    });

    login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const loginPayload = req.body;
        const loginResponse = await this.authService.loginUser(loginPayload);

        const refreshMaxAge = JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

        res.cookie("refresh_token", loginResponse.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: refreshMaxAge,
        });

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Login successful", {
            user: loginResponse.user,
            access_token: loginResponse.accessToken,
        });
    });

}