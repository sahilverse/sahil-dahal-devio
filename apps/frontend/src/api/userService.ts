import api from "./axios";
import type { UserProfile } from "@/types/profile";

export const UserService = {
    getProfile: async (username: string): Promise<UserProfile> => {
        const { data } = await api.get(`/users/${username}`);
        return data.result;
    },

    followUser: async (username: string): Promise<void> => {
        await api.post(`/users/${username}/follow`);
    },

    unfollowUser: async (username: string): Promise<void> => {
        await api.delete(`/users/${username}/follow`);
    },

    uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append("avatar", file);
        const { data } = await api.post("/users/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    uploadBanner: async (file: File): Promise<{ bannerUrl: string }> => {
        const formData = new FormData();
        formData.append("banner", file);
        const { data } = await api.post("/users/banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    removeAvatar: async (): Promise<void> => {
        await api.delete("/users/avatar");
    },

    removeBanner: async (): Promise<void> => {
        await api.delete("/users/banner");
    },
    updateProfile: async (payload: any): Promise<void> => {
        await api.patch("/users/profile", payload);
    },
    updateNames: async (payload: any): Promise<void> => {
        await api.patch("/users/names", payload);
    },

    addExperience: async (payload: any): Promise<any> => {
        const { data } = await api.post("/users/experiences", payload);
        return data.result;
    },

    updateExperience: async (id: string, payload: any): Promise<any> => {
        const { data } = await api.patch(`/users/experiences/${id}`, payload);
        return data.result;
    },

    deleteExperience: async (id: string): Promise<void> => {
        await api.delete(`/users/experiences/${id}`);
    },

    addEducation: async (payload: any): Promise<any> => {
        const { data } = await api.post("/users/educations", payload);
        return data.result;
    },

    updateEducation: async (id: string, payload: any): Promise<any> => {
        const { data } = await api.patch(`/users/educations/${id}`, payload);
        return data.result;
    },

    deleteEducation: async (id: string): Promise<void> => {
        await api.delete(`/users/educations/${id}`);
    },

    addSkill: async (name: string): Promise<any> => {
        const { data } = await api.post("/users/skills", { name });
        return data.result;
    },

    removeSkill: async (id: string): Promise<void> => {
        await api.delete(`/users/skills/${id}`);
    },

    addCertification: async (payload: any): Promise<any> => {
        const { data } = await api.post("/users/certifications", payload);
        return data.result;
    },

    updateCertification: async (id: string, payload: any): Promise<any> => {
        const { data } = await api.patch(`/users/certifications/${id}`, payload);
        return data.result;
    },

    deleteCertification: async (id: string): Promise<void> => {
        await api.delete(`/users/certifications/${id}`);
    },
    
    addProject: async (payload: any): Promise<any> => {
        const { data } = await api.post("/users/projects", payload);
        return data.result;
    },

    updateProject: async (id: string, payload: any): Promise<any> => {
        const { data } = await api.patch(`/users/projects/${id}`, payload);
        return data.result;
    },

    deleteProject: async (id: string): Promise<void> => {
        await api.delete(`/users/projects/${id}`);
    },
};
