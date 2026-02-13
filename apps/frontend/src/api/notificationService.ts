import api from "./axios";
import { PaginatedNotifications } from "@/types/notification";

export const notificationService = {
    getNotifications: async (params: { limit?: number; cursor?: string }) => {
        const { data } = await api.get<{ result: PaginatedNotifications }>("/notifications", { params });
        return data.result;
    },

    getUnreadCount: async () => {
        const { data } = await api.get<{ result: { count: number } }>("/notifications/unread-count");
        return data.result;
    },

    markAsRead: async (id: string) => {
        const { data } = await api.patch(`/notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async () => {
        const { data } = await api.patch("/notifications/read-all");
        return data;
    },
};
