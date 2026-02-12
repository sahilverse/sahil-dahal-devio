import { injectable, inject } from "inversify";
import { NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { NotificationRepository } from "./notification.repository";

@injectable()
export class NotificationService {
    constructor(
        @inject(TYPES.NotificationRepository) private notificationRepository: NotificationRepository
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
        return this.notificationRepository.create(data);
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

    async markRead(id: string) {
        return this.notificationRepository.markAsRead(id);
    }

    async markAllRead(userId: string) {
        await this.notificationRepository.markAllAsRead(userId);
    }
}
