import api from "./axios";

export interface Topic {
    id: string;
    name: string;
    slug: string;
    count: number;
}

export const TopicService = {
    searchTopics: async (query: string): Promise<Topic[]> => {
        const { data } = await api.get("/topics/search", { params: { q: query } });
        return data?.result || [];
    },
};
