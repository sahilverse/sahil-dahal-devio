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

    joinCommunity: async (name: string, message?: string) => {
        const { data } = await api.post(`/communities/${name}/join`, { message });
        return data.result;
    },

    leaveCommunity: async (name: string) => {
        const { data } = await api.delete(`/communities/${name}/leave`);
        return data.result;
    },

    getRules: async (name: string) => {
        const { data } = await api.get(`/communities/${name}/rules`);
        return data.result;
    },

    getSettings: async (name: string) => {
        const { data } = await api.get(`/communities/${name}/settings`);
        return data.result;
    },

    getMembers: async (name: string, limit: number = 20, cursor?: string, q?: string) => {
        const { data } = await api.get(`/communities/${name}/members`, {
            params: { limit, cursor, q }
        });
        return data.result;
    },

    getModerators: async (name: string, limit: number = 10, cursor?: string) => {
        const { data } = await api.get(`/communities/${name}/moderators`, {
            params: { limit, cursor }
        });
        return data.result;
    },

    getJoinRequests: async (name: string) => {
        const { data } = await api.get(`/communities/${name}/requests`);
        return data.result;
    },

    updateSettings: async (name: string, settings: Record<string, any>) => {
        const { data } = await api.patch(`/communities/${name}/settings`, settings);
        return data.result;
    },

    updateRules: async (name: string, rules: any) => {
        const { data } = await api.patch(`/communities/${name}/rules`, rules);
        return data.result;
    },

    updateMedia: async (name: string, formData: FormData) => {
        const { data } = await api.patch(`/communities/${name}/media`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return data.result;
    },

    removeMedia: async (name: string, type: "icon" | "banner") => {
        const { data } = await api.delete(`/communities/${name}/media/${type}`);
        return data.result;
    },

    reviewJoinRequest: async (requestId: string, status: "APPROVED" | "REJECTED") => {
        const { data } = await api.patch(`/communities/requests/${requestId}`, { status });
        return data.result;
    },

    updateModeratorPermissions: async (
        name: string,
        userId: string,
        payload: { isMod: boolean; permissions?: Record<string, boolean> }
    ) => {
        const { data } = await api.patch(`/communities/${name}/moderators/${userId}`, payload);
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
