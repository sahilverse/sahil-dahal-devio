import api from "./axios";
import { CompanyVerificationTier } from "@devio/zod-utils";

export interface CompanySearchResult {
    id: string;
    name: string;
    logoUrl: string | null;
}

export interface CompanyMember {
    userId: string;
    companyId: string;
    role: "OWNER" | "RECRUITER" | "MEMBER";
    user?: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
}

export interface Company {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    websiteUrl: string | null;
    location: string | null;
    size: string | null;
    logoUrl: string | null;
    isVerified: boolean;
    verificationTier: CompanyVerificationTier;
    verifiedDomain: string | null;
    ownerId: string;
    createdAt: string;
    owner?: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
    members?: CompanyMember[];
}

export const CompanyService = {
    search: async (query: string): Promise<CompanySearchResult[]> => {
        const { data } = await api.get("/companies/search", {
            params: { q: query },
        });
        return data.result;
    },

    getManagedCompanies: async (): Promise<Company[]> => {
        const { data } = await api.get("/companies/managed");
        return data.result;
    },

    create: async (companyData: any): Promise<Company> => {
        const { data } = await api.post("/companies", companyData);
        return data.result;
    },

    getBySlug: async (slug: string): Promise<Company> => {
        const { data } = await api.get(`/companies/${slug}`);
        return data.result;
    },

    update: async (id: string, companyData: any): Promise<Company> => {
        const { data } = await api.patch(`/companies/${id}`, companyData);
        return data.result;
    },

    manageMembers: async (id: string, memberData: { userId: string, action: "ADD" | "REMOVE" | "UPDATE_ROLE", role?: string }): Promise<any> => {
        const { data } = await api.post(`/companies/${id}/members`, memberData);
        return data.result;
    },

    verifyDomain: async (id: string, email: string): Promise<Company> => {
        const { data } = await api.post(`/companies/${id}/verify-domain`, { email });
        return data.result;
    },

    uploadLogo: async (id: string, file: File): Promise<{ logoUrl: string }> => {
        const formData = new FormData();
        formData.append("logo", file);
        const { data } = await api.post(`/companies/${id}/logo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    removeLogo: async (id: string): Promise<void> => {
        await api.delete(`/companies/${id}/logo`);
    },
};
