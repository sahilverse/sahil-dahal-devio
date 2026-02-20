import api from "./axios";
import { Company } from "./companyService";
import { JobType, JobWorkplace } from "@devio/zod-utils";

export interface Job {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: JobType;
    workplace: JobWorkplace;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    applyLink: string | null;
    isActive: boolean;
    companyId: string;
    authorId: string;
    createdAt: string;
    company?: Company;
    topics?: { topic: { name: string; slug: string } }[];
}

export interface JobsResponse {
    jobs: Job[];
    total: number;
}

export const JobService = {
    getAll: async (params?: any): Promise<JobsResponse> => {
        const { data } = await api.get("/jobs", { params });
        return data.result;
    },

    getBySlug: async (slug: string): Promise<Job> => {
        const { data } = await api.get(`/jobs/${slug}`);
        return data.result;
    },

    create: async (jobData: {
        title: string;
        description: string;
        type: JobType;
        workplace: JobWorkplace;
        companyId: string;
        location?: string;
        salaryMin?: number;
        salaryMax?: number;
        currency?: string;
        applyLink?: string;
        topics?: string[];
    }): Promise<Job> => {
        const { data } = await api.post("/jobs", jobData);
        return data.result;
    },

    update: async (id: string, jobData: any): Promise<Job> => {
        const { data } = await api.patch(`/jobs/${id}`, jobData);
        return data.result;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/jobs/${id}`);
    },
};
