import api from "./axios";
import { CreatePostFormData } from "@/components/create/CreatePostForm";

export const PostService = {
    createPost: async (data: CreatePostFormData) => {
        const formData = new FormData();
        formData.append("type", data.type);
        formData.append("title", data.title);

        if (data.status) {
            formData.append("status", data.status);
        }

        if (data.communityId) {
            formData.append("communityId", data.communityId);
        }

        if (data.type === "TEXT" || data.type === "QUESTION") {
            if (data.content) {
                formData.append("content", data.content);
            }

            if (data.media && data.media.length > 0) {
                data.media.forEach((file) => {
                    formData.append("media", file);
                });
            }

            if (data.type === "QUESTION" && data.bountyAmount !== undefined) {
                formData.append("bountyAmount", String(data.bountyAmount));
            }
        } else if (data.type === "LINK") {
            formData.append("linkUrl", data.linkUrl);
        }

        if (data.topics && data.topics.length > 0) {
            data.topics.forEach((topic) => {
                formData.append("topics[]", topic);
            });
        }

        const response = await api.post("/posts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    getPosts: async (params: { cursor?: string; limit?: number; userId?: string; communityId?: string; onlySaved?: boolean }) => {
        const response = await api.get("/posts", { params });
        return response.data;
    },

    votePost: async (postId: string, type: "UP" | "DOWN" | null) => {
        const response = await api.post(`/posts/${postId}/vote`, { type });
        return response.data;
    },

    toggleSavePost: async (postId: string) => {
        const response = await api.post(`/posts/${postId}/save`);
        return response.data;
    },

    togglePinPost: async (postId: string, isPinned: boolean) => {
        const response = await api.patch(`/posts/${postId}/pin`, { isPinned });
        return response.data;
    }
};
