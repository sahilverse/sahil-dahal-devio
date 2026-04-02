import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SearchService } from "./search.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class SearchController {
    constructor(@inject(TYPES.SearchService) private searchService: SearchService) { }

    globalSearch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { q, limit } = req.query as { q?: string; limit?: string };

        if (!q) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Search query is required");
        }

        const results = await this.searchService.globalSearch(q, limit ? parseInt(limit) : 10);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Search results fetched successfully", results);
    });
}
