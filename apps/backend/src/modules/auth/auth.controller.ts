import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { UAParser } from "ua-parser-js";
import { TYPES } from "../../types";
import { AuthService } from "./auth.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { JWT_REFRESH_EXPIRATION_DAYS, NODE_ENV } from "../../config/constants";
import { StatusCodes } from "http-status-codes";
import type { LoginServiceResponse } from "./auth.types";
import type { UserAgentInfo } from "./auth.types";

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
        const clientIp = this.getClientIp(req);
        const userAgent = this.getUserAgent(req);
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

        const clientIp = this.getClientIp(req);
        const userAgent = this.getUserAgent(req);

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
        const clientIp = this.getClientIp(req);
        const userAgent = this.getUserAgent(req);

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

    private getClientIp(req: Request): string | null {
        const xForwardedFor = req.headers["x-forwarded-for"];
        if (xForwardedFor) {
            const ips = Array.isArray(xForwardedFor)
                ? xForwardedFor
                : xForwardedFor.split(",");
            return ips.length > 0 ? ips[0]?.trim() ?? null : null;
        }

        return req.socket.remoteAddress || null;
    }

    private getUserAgent(req: Request): UserAgentInfo {
        const rawUA = req.get("user-agent") || null;

        if (!rawUA) {
            return {
                browser: null,
                version: null,
                os: null,
                device: null,
                raw: null,
            };
        }

        const parser = new UAParser(rawUA);
        const result = parser.getResult();

        const browser = result.browser.name || null;
        const version = result.browser.version || null;
        const os = result.os.name ? `${result.os.name} ${result.os.version || ""}`.trim() : null;
        const device = result.device.type || "Desktop";

        return {
            browser,
            version,
            os,
            device,
            raw: rawUA,
        };
    }

}