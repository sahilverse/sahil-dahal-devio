import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";
import { ResponseHandler } from "../utils/ResponseHandler";
import { logger } from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let message: string | Record<string, string> = "Internal Server Error";
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    logger.error(err);

    if (err instanceof ApiError) {
        statusCode = err.statusCode;

        if (err.isOperational) {
            try {
                const parsed = JSON.parse(err.message);
                if (parsed && typeof parsed === "object") {
                    message = parsed as Record<string, string>;
                } else {
                    message = err.message;
                }
            } catch {
                message = err.message;
            }
        }
    }

    return ResponseHandler.sendError(res, statusCode, message);
};
