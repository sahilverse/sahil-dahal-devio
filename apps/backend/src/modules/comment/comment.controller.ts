import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { plainToInstance } from "class-transformer";
import { GetCommentsDto } from "./comment.dto";
import { CommentService } from "./comment.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class CommentController {
    constructor(@inject(TYPES.CommentService) private commentService: CommentService) { }



    getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params as { postId: string };
        const query = plainToInstance(GetCommentsDto, req.query, { excludeExtraneousValues: true });
        const currentUserId = req.user?.id;

        const result = await this.commentService.getComments(postId, query, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comments fetched successfully", result);
    });

    getReplies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { commentId } = req.params as { commentId: string };
        const cursor = req.query.cursor as string | undefined;
        const limit = parseInt(req.query.limit as string) || 10;
        const currentUserId = req.user?.id;

        const result = await this.commentService.getReplies(commentId, { cursor, limit }, currentUserId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Replies fetched successfully", result);
    });

    createComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };
        const files = req.files as Express.Multer.File[] || [];
        const { content, parentId } = req.body as { content: string; parentId?: string };

        const timezoneOffsetHeader = req.headers['x-timezone-offset'];
        const timezoneOffset = timezoneOffsetHeader ? parseInt(timezoneOffsetHeader as string, 10) : undefined;

        const comment = await this.commentService.createComment(userId, postId, { content, parentId }, files, timezoneOffset);
        return ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Comment created successfully", comment);
    });

    updateComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { commentId } = req.params as { commentId: string };
        const { content } = req.body as { content: string };

        const result = await this.commentService.updateComment(userId, commentId, { content });
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comment updated successfully", result);
    });

    deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { commentId } = req.params as { commentId: string };

        await this.commentService.deleteComment(userId, commentId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Comment deleted successfully");
    });

    voteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { commentId } = req.params as { commentId: string };
        const { type } = req.body as { type: "UP" | "DOWN" | null };

        const result = await this.commentService.voteComment(userId, commentId, type);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Vote recorded successfully", result);
    });

    acceptAnswer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };
        const { commentId } = req.body as { commentId: string };

        await this.commentService.acceptAnswer(userId, postId, commentId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Answer accepted successfully");
    });

    unacceptAnswer = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { postId } = req.params as { postId: string };

        await this.commentService.unacceptAnswer(userId, postId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Answer unaccepted successfully");
    });
}
