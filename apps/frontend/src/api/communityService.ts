import api from "./axios";

export const CommunityService = {
    createCommunity: async (data: {
        name: string;
        description?: string;
        visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
        topics: string[];
    }) => {
        const response = await api.post("/communities", data);
        return response.data;
    },

    getCommunity: async (name: string) => {
        const response = await api.get(`/communities/${name}`);
        return response.data;
    },

    joinCommunity: async (communityId: string) => {
        const response = await api.post(`/communities/${communityId}/join`);
        return response.data;
    }
};
