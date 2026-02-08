import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { plainToInstance } from "class-transformer";
import { GetPostsDto } from "./post.dto";
import { PostService } from "./post.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { PostStatus, PostVisibility } from "../../generated/prisma/client";

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

    getPosts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const query = plainToInstance(GetPostsDto, req.query, { excludeExtraneousValues: true });
        const currentUserId = req.user?.id;
        const result = await this.postService.getPosts(query, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Posts fetched successfully", result);
    });
    updatePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };
        const body = req.body;

        const result = await this.postService.updatePost(userId, postId, body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Post updated successfully", result);
    });

    deletePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };

        await this.postService.deletePost(userId, postId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Post deleted successfully");
    });

    getPostCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { status, visibility } = req.query as { status?: PostStatus, visibility?: PostVisibility };

        const result = await this.postService.getPostCount(userId, status, visibility);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Post count fetched successfully", result);
    });

    votePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };
        const { type } = req.body as { type: "UP" | "DOWN" | null };

        const result = await this.postService.votePost(userId, postId, type);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Vote recorded successfully", result);
    });

    toggleSavePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };

        const result = await this.postService.toggleSavePost(userId, postId);
        const message = result.isSaved ? "Post saved successfully" : "Post unsaved successfully";
        ResponseHandler.sendResponse(res, StatusCodes.OK, message, result);
    });

    togglePinPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };
        const { isPinned } = req.body as { isPinned: boolean };

        const result = await this.postService.togglePinPost(userId, postId, isPinned);
        ResponseHandler.sendResponse(res, StatusCodes.OK, isPinned ? "Post pinned successfully" : "Post unpinned successfully", result);
    });
}
