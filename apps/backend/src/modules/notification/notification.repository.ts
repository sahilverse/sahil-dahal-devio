import { injectable, inject } from "inversify";
import { PrismaClient, Notification, NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class NotificationRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: {
        userId: string;
        type: NotificationType;
        title?: string;
        message: string;
        actorId?: string;
        actionUrl?: string;
        data?: any;
    }): Promise<Notification> {
        return this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                actorId: data.actorId,
                actionUrl: data.actionUrl,
                data: data.data,
            }
        });
    }

    async findByUserId(userId: string, limit: number = 20, cursor?: string): Promise<Notification[]> {
        return this.prisma.notification.findMany({
            where: { userId },
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy: { createdAt: "desc" },
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return this.prisma.notification.update({
            where: { id },
            data: { read_at: new Date() }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.prisma.notification.updateMany({
            where: { userId, read_at: null },
            data: { read_at: new Date() }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.notification.delete({ where: { id } });
    }
}
