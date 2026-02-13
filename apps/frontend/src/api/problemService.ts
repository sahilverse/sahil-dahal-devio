import api from "./axios";
import { Problem, ProblemListItem, PaginatedProblems } from "@/types/problem";

export const problemService = {
    getProblems: async (params: any) => {
        const { data } = await api.get<{ result: PaginatedProblems }>("/problems", { params });
        return data.result;
    },

    getProblemBySlug: async (slug: string) => {
        const { data } = await api.get<{ result: Problem }>(`/problems/${slug}`);
        return data.result;
    },

    getBoilerplate: async (slug: string, language: string) => {
        const { data } = await api.get<{ result: { code: string } }>(`/problems/${slug}/boilerplate`, {
            params: { language }
        });
        return data.result;
    },

    saveDraft: async (slug: string, language: string, code: string) => {
        const { data } = await api.patch<{ result: any }>(`/problems/${slug}/draft`, { language, code });
        return data.result;
    },

    getLanguages: async () => {
        const { data } = await api.get<{ result: string[] }>("/problems/languages");
        return data.result;
    }
};
