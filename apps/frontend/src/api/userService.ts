import api from "./axios";
import type { UserProfile } from "@/types/user";

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
};
