import { Request, Response, NextFunction } from "express";

export const sanitizeChatRequest = (req: Request, _res: Response, next: NextFunction) => {
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.body.media = req.files;
    } else if (req.file) {
        req.body.media = [req.file];
    } else {
        if (req.body.media === "" || req.body.media === "undefined") {
            req.body.media = undefined;
        }
    }

    if (req.body.content === "" || req.body.content === "undefined") {
        req.body.content = undefined;
    }

    next();
};
