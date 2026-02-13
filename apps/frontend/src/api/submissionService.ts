import api from "./axios";
import { Submission, SubmissionResult } from "@/types/submission";

export const submissionService = {
    run: async (data: { slug: string; code: string; language: string }) => {
        const { data: res } = await api.post<{ result: SubmissionResult[] }>("/submissions/run", data);
        return res.result;
    },

    submit: async (data: { slug: string; code: string; language: string; eventId?: string }) => {
        const { data: res } = await api.post<{ result: Submission }>("/submissions/submit", data);
        return res.result;
    },

    getSubmissions: async (slug: string, params: { cursor?: string; limit?: number } = {}) => {
        const { data: res } = await api.get<{ result: { items: Submission[]; nextCursor: string | null } }>(
            `/submissions/${slug}`,
            { params }
        );
        return res.result;
    }
};
