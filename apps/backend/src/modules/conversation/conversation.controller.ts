import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ConversationService } from "./conversation.service";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { StartConversationInput, SendMessageInput } from "@devio/zod-utils";

@injectable()
export class ConversationController {
    constructor(@inject(TYPES.ConversationService) private conversationService: ConversationService) { }

    startConversation = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const data: StartConversationInput = req.body;

        const result = await this.conversationService.startConversation(userId, data);
        return ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Conversation started", result);
    };

    sendMessage = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;
        const data: SendMessageInput = req.body;
        const files = req.files as Express.Multer.File[];

        const result = await this.conversationService.sendMessage(userId, conversationId, data, files);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Message sent", result);
    };

    acceptInvite = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;

        const result = await this.conversationService.acceptInvite(userId, conversationId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Invite accepted", result);
    };

    declineInvite = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;

        const result = await this.conversationService.declineInvite(userId, conversationId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Invite declined", result);
    };

    getInteractions = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const { limit, cursor } = req.query;

        const result = await this.conversationService.getInteractions(
            userId,
            limit ? parseInt(limit as string) : undefined,
            cursor as string
        );
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Interactions fetched", result);
    };

    getMessages = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;
        const { limit, cursor } = req.query;

        const result = await this.conversationService.getMessages(
            userId,
            conversationId,
            limit ? parseInt(limit as string) : undefined,
            cursor as string
        );
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Messages fetched", result);
    };

    markAsSeen = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;

        const result = await this.conversationService.markAsSeen(userId, conversationId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Messages marked as seen", result);
    };

    editMessage = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const messageId = req.params.messageId as string;
        const { content } = req.body;

        const result = await this.conversationService.editMessage(userId, messageId, content);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Message updated", result);
    };

    deleteMessage = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const messageId = req.params.messageId as string;
        const mode = req.query.mode as 'me' | 'everyone' || 'me';

        await this.conversationService.deleteMessage(userId, messageId, mode);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Message deleted");
    };

    deleteConversation = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const conversationId = req.params.conversationId as string;

        await this.conversationService.deleteConversation(userId, conversationId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Conversation deleted");
    };

    searchConversations = async (req: Request, res: Response) => {
        const userId = (req.user as any).id;
        const query = req.query.q as string;

        const result = await this.conversationService.searchConversations(userId, query);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Conversations found", result);
    };
}
