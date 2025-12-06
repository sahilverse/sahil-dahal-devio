import { StatusCodes } from "http-status-codes";
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string | Record<string, string>, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(typeof message === "string" ? message : JSON.stringify(message));
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}
