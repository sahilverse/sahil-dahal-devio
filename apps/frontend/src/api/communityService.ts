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

    joinCommunity: async (name: string) => {
        const response = await api.post(`/communities/${name}/join`, {});
        return response.data;
    },

    getExploreCommunities: async (limit: number = 10, cursor?: string, topicSlug?: string) => {
        const response = await api.get("/communities/explore", {
            params: { limit, cursor, topicSlug }
        });
        return response.data;
    }
};

