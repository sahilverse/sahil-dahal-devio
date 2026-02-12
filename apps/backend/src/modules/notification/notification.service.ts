import { injectable, inject } from "inversify";
import { NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { NotificationRepository } from "./notification.repository";
import { SocketService } from "../socket/socket.service";
import { logger } from "../../utils/logger";
import { plainToInstance } from "class-transformer";
import { NotificationResponseDto } from "./notification.dto";

@injectable()
export class NotificationService {
    constructor(
        @inject(TYPES.NotificationRepository) private notificationRepository: NotificationRepository,
        @inject(TYPES.SocketService) private socketService: SocketService
    ) { }

    async notify(data: {
        userId: string;
        type: NotificationType;
        title?: string;
        message: string;
        actorId?: string;
        actionUrl?: string;
        data?: any;
    }) {
        const notification = await this.notificationRepository.create(data);
        try {
            const dto = plainToInstance(NotificationResponseDto, notification, { excludeExtraneousValues: true });
            this.socketService.io.to(`user:${data.userId}`).emit("notification:new", dto);
        } catch (error) {
            logger.error(error as Error, `Failed to emit real-time notification to user ${data.userId}`);
        }

        return notification;
    }

    async getNotifications(userId: string, limit: number = 20, cursor?: string) {
        const notifications = await this.notificationRepository.findByUserId(userId, limit, cursor);

        let nextCursor: string | null = null;
        if (notifications.length > limit) {
            const nextItem = notifications.pop();
            nextCursor = nextItem?.id || null;
        }

        return { notifications, nextCursor };
    }

    async markRead(id: string, userId: string) {
        return this.notificationRepository.markAsRead(id, userId);
    }

    async markAllRead(userId: string) {
        await this.notificationRepository.markAllAsRead(userId);
    }

    async getUnreadCount(userId: string) {
        return this.notificationRepository.countUnread(userId);
    }

    async updateNotificationsByData(dataQuery: any, update: any) {
        return this.notificationRepository.updateManyByData(dataQuery, update);
    }
}
