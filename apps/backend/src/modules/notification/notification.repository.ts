import { injectable, inject } from "inversify";
import { PrismaClient, Notification, NotificationType, Prisma } from "../../generated/prisma/client";
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
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        return this.prisma.notification.update({
            where: {
                id,
                userId // Ensure user owns the notification
            },
            data: { read_at: new Date() }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.prisma.notification.updateMany({
            where: { userId, read_at: null },
            data: { read_at: new Date() }
        });
    }

    async countUnread(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: { userId, read_at: null }
        });
    }

    async updateManyByData(dataQuery: any, update: Prisma.NotificationUpdateInput): Promise<void> {
        const notifications = await this.prisma.notification.findMany({
            where: {
                data: {
                    path: ["requestId"],
                    equals: dataQuery.requestId
                }
            }
        });

        if (notifications.length > 0) {
            await this.prisma.notification.updateMany({
                where: {
                    id: { in: notifications.map(n => n.id) }
                },
                data: update
            });
        }
    }

    async delete(id: string): Promise<void> {
        await this.prisma.notification.delete({ where: { id } });
    }
}
