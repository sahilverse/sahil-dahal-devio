import api from "./axios";

export const CommunityService = {
    createCommunity: async (payload: {
        name: string;
        description?: string;
        visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
        topics: string[];
    }) => {
        const { data } = await api.post("/communities", payload);
        return data.result;
    },

    getCommunity: async (name: string) => {
        const { data } = await api.get(`/communities/${name}`);
        return data.result;
    },

    joinCommunity: async (name: string) => {
        const { data } = await api.post(`/communities/${name}/join`, {});
        return data.result;
    },

    getExploreCommunities: async (limit: number = 10, cursor?: string, topicSlug?: string) => {
        const { data } = await api.get("/communities/explore", {
            params: { limit, cursor, topicSlug }
        });
        return data.result;
    },

    searchCommunities: async (query: string, limit: number = 5) => {
        const { data } = await api.get("/communities", {
            params: { q: query, limit }
        });
        return data.result;
    }
};

