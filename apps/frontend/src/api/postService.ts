import api from "./axios";
import { CreatePostFormData } from "@/components/create/CreatePostForm";

export const PostService = {
    createPost: async (payload: CreatePostFormData) => {
        const formData = new FormData();
        formData.append("type", payload.type);
        formData.append("title", payload.title);

        if (payload.status) {
            formData.append("status", payload.status);
        }

        if (payload.communityId) {
            formData.append("communityId", payload.communityId);
        }

        if (payload.type === "TEXT" || payload.type === "QUESTION") {
            if (payload.content) {
                formData.append("content", payload.content);
            }

            if (payload.media && payload.media.length > 0) {
                payload.media.forEach((file) => {
                    formData.append("media", file);
                });
            }

            if (payload.type === "QUESTION" && payload.bountyAmount !== undefined) {
                formData.append("bountyAmount", String(payload.bountyAmount));
            }
        } else if (payload.type === "LINK") {
            formData.append("linkUrl", payload.linkUrl);
        }

        if (payload.topics && payload.topics.length > 0) {
            payload.topics.forEach((topic) => {
                formData.append("topics[]", topic);
            });
        }

        const { data } = await api.post("/posts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return data.result;
    },

    getPosts: async (params: { cursor?: string; limit?: number; userId?: string; communityId?: string; onlySaved?: boolean; sortBy?: string }) => {
        const { data } = await api.get("/posts", { params });
        return data.result;
    },

    getPostById: async (postId: string) => {
        const { data } = await api.get(`/posts/${postId}`);
        return data.result;
    },

    votePost: async (postId: string, type: "UP" | "DOWN" | null) => {
        const { data } = await api.post(`/posts/${postId}/vote`, { type });
        return data.result;
    },

    toggleSavePost: async (postId: string) => {
        const { data } = await api.post(`/posts/${postId}/save`);
        return data.result;
    },

    togglePinPost: async (postId: string, isPinned: boolean) => {
        const { data } = await api.patch(`/posts/${postId}/pin`, { isPinned });
        return data.result;
    },
    deletePost: async (postId: string) => {
        const { data } = await api.delete(`/posts/${postId}`);
        return data.result;
    },
    updatePost: async (postId: string, payload: { visibility?: string; status?: string; title?: string; content?: string }) => {
        const { data } = await api.patch(`/posts/${postId}`, payload);
        return data.result;
    }
};
