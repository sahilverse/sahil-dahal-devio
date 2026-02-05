import api from "./axios";

export interface CompanySearchResult {
    id: string;
    name: string;
    logoUrl: string | null;
}

export const CompanyService = {
    search: async (query: string): Promise<CompanySearchResult[]> => {
        const { data } = await api.get("/companies/search", {
            params: { q: query },
        });
        return data.result;
    },
};
