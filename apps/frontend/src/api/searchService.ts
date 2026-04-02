import axiosInstance from "./axios";

export enum SearchResultType {
    USER = "user",
    TOPIC = "topic",
    JOB = "job",
    PROBLEM = "problem",
    COMPANY = "company",
    COMMUNITY = "community",
    COURSE = "course"
}

export interface SearchResult {
    id: string;
    name: string;
    slug: string;
    type: SearchResultType;
    iconUrl: string | null;
    metadata?: any;
}

export interface GlobalSearchResponse {
    users: SearchResult[];
    topics: SearchResult[];
    jobs: SearchResult[];
    problems: SearchResult[];
    companies: SearchResult[];
    communities: SearchResult[];
    courses: SearchResult[];
}

export const searchService = {
    globalSearch: async (query: string, limit: number = 10): Promise<GlobalSearchResponse> => {
        const response = await axiosInstance.get(`/search`, {
            params: { q: query, limit }
        });
        return response.data.result;
    }
};
