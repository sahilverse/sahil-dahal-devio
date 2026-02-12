import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { NotificationService } from "./notification.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { plainToInstance } from "class-transformer";
import { NotificationResponseDto, GetNotificationsDto } from "./notification.dto";

@injectable()
export class NotificationController {
    constructor(
        @inject(TYPES.NotificationService) private notificationService: NotificationService
    ) { }

    getNotifications = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const query = plainToInstance(GetNotificationsDto, req.query, { excludeExtraneousValues: true });

        const { notifications, nextCursor } = await this.notificationService.getNotifications(
            userId,
            query.limit,
            query.cursor
        );

        const data = plainToInstance(NotificationResponseDto, notifications, { excludeExtraneousValues: true });

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Notifications fetched successfully", {
            notifications: data,
            nextCursor
        });
    });

    markRead = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const userId = req.user!.id;

        await this.notificationService.markRead(id, userId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Notification marked as read");
    });

    markAllRead = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        await this.notificationService.markAllRead(userId);
        return ResponseHandler.sendResponse(res, StatusCodes.OK, "All notifications marked as read");
    });
}
