import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { AuthService } from "../services/auth.service";
import { asyncHandler, ResponseHandler, RequestUtil } from "../../../utils";
import { JWT_REFRESH_EXPIRATION_DAYS, NODE_ENV } from "../../../config/constants";
import { StatusCodes } from "http-status-codes";
import type { LoginServiceResponse } from "../auth.types";

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
        const { ip: clientIp, userAgent } = RequestUtil.getIpAndUserAgent(req);

        const loginResponse: LoginServiceResponse = await this.authService.loginUser(loginPayload, clientIp!, userAgent);

        const refreshMaxAge = JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

        res.cookie("refresh_token", loginResponse.refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: refreshMaxAge,
        });

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Login successful", {
            user: loginResponse.user,
            access_token: loginResponse.accessToken,
        });
    });

    logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies["refresh_token"];

        await this.authService.logoutUser(refreshToken);

        res.clearCookie("refresh_token");
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Logout successful");
    });

    refreshTokens = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const oldRefreshToken = req.cookies["refresh_token"];
        if (!oldRefreshToken) {
            return ResponseHandler.sendResponse(res, StatusCodes.UNAUTHORIZED, "Refresh token missing");
        }

        const { ip: clientIp, userAgent } = RequestUtil.getIpAndUserAgent(req);

        const refreshResponse = await this.authService.refreshTokens(oldRefreshToken, clientIp!, userAgent);

        const refreshMaxAge = JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

        res.cookie("refresh_token", refreshResponse.refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: "strict",
            maxAge: refreshMaxAge,
        });

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Tokens refreshed successfully", {
            user: refreshResponse.user,
            access_token: refreshResponse.accessToken,
        });
    });

    forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { identifier } = req.body;
        await this.authService.forgotPassword(identifier);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Password reset email sent");
    });

    verifyPasswordResetToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { token, identifier } = req.body;
        const { ip: clientIp, userAgent } = RequestUtil.getIpAndUserAgent(req);

        const reset_session_token = await this.authService.verifyPasswordResetToken(clientIp!, userAgent, token, identifier);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Password reset token verified successfully", { reset_session_token });
    });

    resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { newPassword } = req.body;
        const email = req.user?.email!;

        await this.authService.resetPassword(email, newPassword);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Password reset successfully");
    });

    sendEmailVerificationToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const email = req.body?.email || req.user?.email!;
        await this.authService.sendEmailVerificationToken(email);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Email verification token sent");
    });

    verifyEmailVerificationToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { token, email } = req.body;
        await this.authService.verifyEmailVerificationToken(token, email);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Email verified successfully");
    });




}