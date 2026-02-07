import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { TopicService } from "./topic.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class TopicController {
    constructor(@inject(TYPES.TopicService) private topicService: TopicService) { }

    searchTopics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { q } = req.query as { q: string };

        if (!q) {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Topics fetched successfully", []);
        }

        const topics = await this.topicService.searchTopics(q);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Topics fetched successfully", topics);
    });

    createTopic = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Topic name is required");
        }

        const topic = await this.topicService.createTopic(name);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Topic created successfully", topic);
    });
}
