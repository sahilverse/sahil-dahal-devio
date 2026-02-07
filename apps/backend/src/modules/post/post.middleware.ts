import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils";

export const sanitizePostRequest = (req: Request, _res: Response, next: NextFunction) => {
    // 1. Handle Empty/Undefined fields
    const optionalFields = ["communityId", "linkUrl", "content", "bountyAmount", "pollOptions", "topics"];
    optionalFields.forEach((field) => {
        if (req.body[field] === "" || req.body[field] === "undefined") {
            req.body[field] = undefined;
        }
    });

    // 2. Parse JSON Fields
    const jsonFields = ["topics", "pollOptions"];
    jsonFields.forEach((field) => {

        try {
            if (typeof req.body[field] === "string") {
                req.body[field] = JSON.parse(req.body[field] || "[]");
            }
        } catch (error) {
            logger.error(error, `Error parsing ${field}`);
        }

    });

    // 3. Convert Numeric Fields
    if (req.body.bountyAmount) {
        req.body.bountyAmount = Number(req.body.bountyAmount);
    }

    // 4. Attach Media
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.body.media = req.files;
    } else {
        req.body.media = undefined;
    }

    next();
};
