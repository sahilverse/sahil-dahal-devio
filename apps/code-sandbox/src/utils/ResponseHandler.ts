import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ResponseHandler {
    static sendResponse(
        res: Response,
        statusCode: StatusCodes,
        message?: string,
        result?: any
    ) {
        return res.status(statusCode).json({
            success: true,
            statusCode,
            message,
            result,
        });
    }

    static sendError(
        res: Response,
        statusCode: StatusCodes,
        message?: string | Record<string, string>
    ) {
        return res.status(statusCode).json({
            success: false,
            statusCode,
            errorMessage: message,
        });
    }
}
