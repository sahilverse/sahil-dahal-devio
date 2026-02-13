import api from "./axios";
import type { Conversation, Message } from "@/types/conversation";

export const conversationService = {
    startConversation: async (recipientId: string, message: string): Promise<Conversation> => {
        const { data } = await api.post<{ result: Conversation }>("/conversations", {
            recipientId,
            message,
        });
        return data.result;
    },

    getConversations: async (params: { limit?: number; cursor?: string }): Promise<Conversation[]> => {
        const { data } = await api.get<{ result: Conversation[] }>("/conversations", { params });
        return data.result;
    },

    searchConversations: async (query: string): Promise<Conversation[]> => {
        const { data } = await api.get<{ result: Conversation[] }>("/conversations/search", {
            params: { q: query },
        });
        return data.result;
    },

    getMessages: async (
        conversationId: string,
        params: { limit?: number; cursor?: string }
    ): Promise<Message[]> => {
        const { data } = await api.get<{ result: Message[] }>(
            `/conversations/${conversationId}/messages`,
            { params }
        );
        return data.result;
    },

    sendMessage: async (
        conversationId: string,
        content?: string,
        media?: File[]
    ): Promise<Message> => {
        const formData = new FormData();
        if (content) formData.append("content", content);
        if (media) {
            media.forEach((file) => formData.append("media", file));
        }
        const { data } = await api.post<{ result: Message }>(
            `/conversations/${conversationId}/messages`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data.result;
    },

    acceptInvite: async (conversationId: string): Promise<Conversation> => {
        const { data } = await api.post<{ result: Conversation }>(
            `/conversations/${conversationId}/accept`
        );
        return data.result;
    },

    declineInvite: async (conversationId: string): Promise<Conversation> => {
        const { data } = await api.post<{ result: Conversation }>(
            `/conversations/${conversationId}/decline`
        );
        return data.result;
    },

    markAsSeen: async (conversationId: string): Promise<void> => {
        await api.post(`/conversations/${conversationId}/seen`);
    },

    editMessage: async (messageId: string, content: string): Promise<Message> => {
        const { data } = await api.patch<{ result: Message }>(
            `/conversations/messages/${messageId}`,
            { content }
        );
        return data.result;
    },

    deleteMessage: async (messageId: string, mode: "me" | "everyone"): Promise<void> => {
        await api.delete(`/conversations/messages/${messageId}`, {
            params: { mode },
        });
    },

    deleteConversation: async (conversationId: string): Promise<void> => {
        await api.delete(`/conversations/${conversationId}`);
    },

    getUnreadCount: async (): Promise<{ messages: number; requests: number; total: number }> => {
        const { data } = await api.get<{ result: { messages: number; requests: number; total: number } }>("/conversations/unread-count");
        return data.result;
    },
};
