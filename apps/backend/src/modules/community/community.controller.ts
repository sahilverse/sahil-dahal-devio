
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CommunityService } from "./community.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { CreateCommunityInput } from "@devio/zod-utils";

@injectable()
export class CommunityController {
    constructor(@inject(TYPES.CommunityService) private communityService: CommunityService) { }

    createCommunity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const data = req.body as CreateCommunityInput;

        const timezoneOffsetHeader = req.headers['x-timezone-offset'];
        const timezoneOffset = timezoneOffsetHeader ? parseInt(timezoneOffsetHeader as string, 10) : undefined;

        const community = await this.communityService.createCommunity(userId, data, timezoneOffset);

        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Community created successfully", community);
    });

    getCommunityByName = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        const userId = req.user?.id;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }
        const community = await this.communityService.getCommunityByName(name, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Community fetched successfully", community);
    });

    getModerators = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        const { limit, cursor } = req.query;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const limitNum = limit ? parseInt(limit as string) : 10;
        const cursorStr = cursor ? cursor as string : undefined;

        const result = await this.communityService.getCommunityModerators(name, limitNum, cursorStr);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Moderators fetched successfully", result);
    });

    searchCommunities = asyncHandler(async (req: Request, res: Response) => {
        const { q, limit, cursor } = req.query;
        const result = await this.communityService.searchCommunities(
            (q as string) || "",
            limit ? parseInt(limit as string) : 10,
            cursor as string | undefined
        );
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Communities fetched successfully", result);
    });

    joinCommunity = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;
        const { message } = req.body || {};

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const result = await this.communityService.joinCommunity(name, userId, message);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Join request processed", result);
    });

    leaveCommunity = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        await this.communityService.leaveCommunity(name, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Successfully left the community");
    });

    getJoinRequests = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;
        const { limit, cursor } = req.query;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const result = await this.communityService.getPendingJoinRequests(
            name,
            userId,
            limit ? parseInt(limit as string) : 10,
            cursor as string | undefined
        );
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Join requests fetched successfully", result);
    });

    reviewJoinRequest = asyncHandler(async (req: Request, res: Response) => {
        const reviewerId = req.user!.id;
        const { requestId } = req.params;
        const { status } = req.body;

        if (!requestId || !status) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Request ID and status are required");
        }

        await this.communityService.reviewJoinRequest(requestId, reviewerId, status);
        ResponseHandler.sendResponse(res, StatusCodes.OK, `Request ${status.toLowerCase()} successfully`);
    });

    updateSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;
        const data = req.body;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        await this.communityService.updateSettings(name, userId, data);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Settings updated successfully");
    });

    getSettings = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const result = await this.communityService.getSettings(name, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Settings fetched successfully", result);
    });

    getMembers = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { name } = req.params;
        const { limit = '10', cursor, q } = req.query;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const result = await this.communityService.getMembers(name, parseInt(limit as string), cursor as string, q as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Members fetched successfully", result);
    });

    getRules = asyncHandler(async (req: Request, res: Response) => {
        const { name } = req.params;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        const result = await this.communityService.getRules(name);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Rules fetched successfully", result);
    });

    updateRules = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;
        const rules = req.body;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        await this.communityService.updateRules(name, userId, rules);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Rules updated successfully");
    });

    updateMedia = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name } = req.params;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name is required");
        }

        if (!files?.['icon']?.[0] && !files?.['banner']?.[0]) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community media is required");
        }

        await this.communityService.updateMedia(name, userId, {
            icon: files?.['icon']?.[0],
            banner: files?.['banner']?.[0]
        });

        ResponseHandler.sendResponse(res, StatusCodes.OK, "Community media updated successfully");
    });

    updateModeratorPermissions = asyncHandler(async (req: Request, res: Response) => {
        const adminId = req.user!.id;
        const { name, userId } = req.params;
        const { isMod, permissions } = req.body;

        if (!name || !userId) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name and user ID are required");
        }

        await this.communityService.updateModeratorPermissions(name, adminId, userId, isMod, permissions);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Moderator permissions updated successfully");
    });

    removeMedia = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name, type } = req.params;

        if (!name || !type) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Community name and media type are required");
        }

        await this.communityService.removeMedia(name, userId, type as 'icon' | 'banner');
        ResponseHandler.sendResponse(res, StatusCodes.OK, `Community ${type} removed successfully`);
    });

    getExploreCommunities = asyncHandler(async (req: Request, res: Response) => {
        const { limit, cursor, topicSlug } = req.query;
        const userId = (req as any).user?.id;
        const result = await this.communityService.getExploreCommunities(
            limit ? parseInt(limit as string) : 10,
            cursor as string | undefined,
            topicSlug as string | undefined,
            userId
        );
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Explore communities fetched successfully", result);
    });
}
