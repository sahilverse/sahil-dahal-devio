import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { LANGUAGE_CONFIG } from "../config/languages";
import { ApiError } from "../utils/ApiError";

const MAX_CODE_SIZE_BYTES = 51200; // 50KB

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.path === '/session/start') {
            const { language } = req.body;
            if (!language) {
                throw new ApiError("Language is required", StatusCodes.BAD_REQUEST);
            }
            if (!LANGUAGE_CONFIG[language]) {
                throw new ApiError(
                    `Unsupported language: ${language}. Supported languages: ${Object.keys(LANGUAGE_CONFIG).join(", ")}`,
                    StatusCodes.BAD_REQUEST
                );
            }
        }

        if (req.path.includes('/execute')) {
            const { code } = req.body;
            if (!code) {
                throw new ApiError("Code is required", StatusCodes.BAD_REQUEST);
            }
            if (Buffer.byteLength(code, 'utf8') > MAX_CODE_SIZE_BYTES) {
                throw new ApiError(
                    `Code size exceeds limit of ${MAX_CODE_SIZE_BYTES} bytes`,
                    StatusCodes.BAD_REQUEST
                );
            }
        }

        if (req.path.includes('/input')) {
            const { input } = req.body;
            if (input === undefined) {
                throw new ApiError("Input is required", StatusCodes.BAD_REQUEST);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
