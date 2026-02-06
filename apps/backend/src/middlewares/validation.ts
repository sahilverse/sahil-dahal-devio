import { Request, Response, NextFunction } from "express";
import { ZodSafeParseResult, ZodType } from "zod";
import { ResponseHandler } from "../utils";

export const validateRequest = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result: ZodSafeParseResult<any> = schema.safeParse(req.body);
        if (!result.success) {
            ResponseHandler.sendValidationError(res, result);
            return;
        }
        req.body = result.data;
        next();
    };
}

export const validateQuery = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result: ZodSafeParseResult<any> = schema.safeParse(req.query);
        if (!result.success) {
            ResponseHandler.sendValidationError(res, result);
            return;
        }
        Object.assign(req.query, result.data);
        next();
    };
}