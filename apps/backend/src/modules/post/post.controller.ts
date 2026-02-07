import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { PostService } from "./post.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class PostController {
    constructor(@inject(TYPES.PostService) private postService: PostService) { }

    createPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const files = req.files as Express.Multer.File[] || [];
        const body = req.body;

        const post = await this.postService.createPost(userId, body, files);
        return ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Post created successfully", post);

    });
}
