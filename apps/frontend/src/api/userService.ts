import api from "./axios";
import type { UserProfile } from "@/types/profile";

export const UserService = {
    getProfile: async (username: string): Promise<UserProfile> => {
        const { data } = await api.get(`/users/${username}`);
        return data.result;
    },

    followUser: async (username: string): Promise<void> => {
        await api.post(`/users/${username}/follow`);
    },

    unfollowUser: async (username: string): Promise<void> => {
        await api.delete(`/users/${username}/follow`);
    },

    uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append("avatar", file);
        const { data } = await api.post("/users/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    uploadBanner: async (file: File): Promise<{ bannerUrl: string }> => {
        const formData = new FormData();
        formData.append("banner", file);
        const { data } = await api.post("/users/banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    removeAvatar: async (): Promise<void> => {
        await api.delete("/users/avatar");
    },

    removeBanner: async (): Promise<void> => {
        await api.delete("/users/banner");
    },
};
