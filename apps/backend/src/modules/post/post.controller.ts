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



    getPosts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const query = plainToInstance(GetPostsDto, req.query, { excludeExtraneousValues: true });
        const currentUserId = req.user?.id;
        const result = await this.postService.getPosts(query, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Posts fetched successfully", result);
    });

    getPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params as { postId: string };
        const currentUserId = req.user?.id;

        const result = await this.postService.getPost(postId, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Post fetched successfully", result);
    });

    createPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const files = req.files as Express.Multer.File[] || [];
        const body = req.body;

        const timezoneOffsetHeader = req.headers['x-timezone-offset'];
        const timezoneOffset = timezoneOffsetHeader ? parseInt(timezoneOffsetHeader as string, 10) : undefined;

        const post = await this.postService.createPost(userId, body, files, timezoneOffset);
        return ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Post created successfully", post);

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
        const { isPinned, communityId } = req.body as { isPinned: boolean, communityId?: string };

        const result = await this.postService.togglePinPost(userId, postId, isPinned, communityId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, isPinned ? "Post pinned successfully" : "Post unpinned successfully", result);
    });
}
