import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { OAuthService } from "../services/oauth.service";
import { asyncHandler, ResponseHandler, RequestUtil } from "../../../utils";
import { StatusCodes } from "http-status-codes";
import type { OAuthLoginResult } from "../auth.types";

@injectable()
export class OAuthController {
    constructor(@inject(TYPES.OAuthService) private oauthService: OAuthService) { }

    googleCallback = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { code } = req.body;

        if (!code) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Authorization code is required");
        }

        const { ip: clientIp, userAgent } = RequestUtil.getIpAndUserAgent(req);

        const result: OAuthLoginResult = await this.oauthService.handleGoogleOAuth(
            code,
            clientIp!,
            userAgent
        );

        ResponseHandler.setAuthCookie(res, result.refreshToken);

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Google authentication successful", {
            user: result.user,
            access_token: result.accessToken,
            is_new_user: result.isNewUser,
        });
    });

    githubCallback = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { code } = req.body;

        if (!code) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Authorization code is required");
        }

        const { ip: clientIp, userAgent } = RequestUtil.getIpAndUserAgent(req);

        const result: OAuthLoginResult = await this.oauthService.handleGithubOAuth(
            code,
            clientIp!,
            userAgent
        );

        ResponseHandler.setAuthCookie(res, result.refreshToken);

        ResponseHandler.sendResponse(res, StatusCodes.OK, "GitHub authentication successful", {
            user: result.user,
            access_token: result.accessToken,
            is_new_user: result.isNewUser,
        });
    });


}
