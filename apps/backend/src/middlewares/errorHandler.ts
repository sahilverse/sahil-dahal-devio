import { Request, Response, NextFunction } from "express";
import { ApiError, ResponseHandler, logger } from "../utils";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    if (err instanceof ApiError) {
        const message = err.isOperational ? err.message : "Internal Server Error";
        return ResponseHandler.sendError(res, err.statusCode, message);
    }

    ResponseHandler.sendError(res, 500, "Internal Server Error");
};