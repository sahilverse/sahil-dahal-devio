import { injectable, inject } from "inversify";
import { NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { NotificationRepository } from "./notification.repository";
import { SocketService } from "../socket/socket.service";
import { logger } from "../../utils/logger";

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

        // Emit Real-time Socket Event
        try {
            this.socketService.io.to(`user:${data.userId}`).emit("notification:new", notification);
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
}
