import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodSafeParseResult } from 'zod';
import { JWT_REFRESH_EXPIRATION_DAYS, NODE_ENV, PROD_DOMAIN } from '../config/constants';

export class ResponseHandler {
    static sendResponse(res: Response, statusCode: StatusCodes, message?: string, result?: any) {
        return res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            result
        });
    }

    static sendError(res: Response, statusCode: StatusCodes, message?: string | Record<string, string>) {
        return res.status(statusCode).json({
            success: false,
            statusCode,
            errorMessage: message
        });
    }

    static sendValidationError(res: Response, result: ZodSafeParseResult<any>) {

        if (result.success) return;

        const errorMessage: Record<string, string> = {};
        let plainMessage = '';

        result.error.issues.forEach((err) => {
            const key = err.path.join('.');

            if (key) {
                errorMessage[key] = err.message;
            } else {
                plainMessage = err.message;
            }
        });

        if (plainMessage && Object.keys(errorMessage).length === 0) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, plainMessage);
        }

        return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, errorMessage);

    }

    static setAuthCookie(res: Response, refreshToken: string) {
        const refreshMaxAge = JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

        if (NODE_ENV === 'production') {
            res.clearCookie('refresh_token', { domain: `.${PROD_DOMAIN}` });
        }

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'lax',
            domain: NODE_ENV === 'production' ? `.${PROD_DOMAIN}` : undefined,
            maxAge: refreshMaxAge,
        });
    }

    static clearAuthCookie(res: Response) {
        res.clearCookie('refresh_token', {
            domain: NODE_ENV === 'production' ? `.${PROD_DOMAIN}` : undefined,
        });
    }
}