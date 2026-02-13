import api from "./axios";
import { GetCommentsParams, GetRepliesParams } from "@/types/comment";

export const CommentService = {
    createComment: async (postId: string, content: string, parentId?: string, media?: File[]) => {
        const formData = new FormData();
        formData.append("content", content);
        if (parentId) formData.append("parentId", parentId);

        if (media && media.length > 0) {
            media.forEach((file) => {
                formData.append("media", file);
            });
        }

        const response = await api.post(`/posts/${postId}/comments`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    getComments: async (postId: string, params: GetCommentsParams) => {
        const response = await api.get(`/posts/${postId}/comments`, { params });
        return response.data;
    },

    getReplies: async (commentId: string, params: GetRepliesParams) => {
        const response = await api.get(`/comments/${commentId}/replies`, { params });
        return response.data;
    },

    voteComment: async (commentId: string, type: "UP" | "DOWN" | null) => {
        const response = await api.post(`/comments/${commentId}/vote`, { type });
        return response.data;
    },

    updateComment: async (commentId: string, content: string) => {
        const response = await api.patch(`/comments/${commentId}`, { content });
        return response.data;
    },

    deleteComment: async (commentId: string) => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },

    acceptAnswer: async (postId: string, commentId: string) => {
        const response = await api.post(`/posts/${postId}/accept-answer`, { commentId });
        return response.data;
    },

    unacceptAnswer: async (postId: string) => {
        const response = await api.delete(`/posts/${postId}/accept-answer`);
        return response.data;
    }
};
