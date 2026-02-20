import api from "./axios";

export interface CreateEventFormData {
    title: string;
    description: string;
    type: string;
    communityId: string;
    startsAt: string;
    endsAt: string;
    minAuraPoints?: number;
    entryCipherCost?: number;
    maxParticipants?: number;
    participationAura?: number;
    imageUrl?: string;
    requiresTeam?: boolean;
    teamSize?: number;
    externalUrl?: string;
    visibility?: string;
    status?: string;
}

export const EventService = {
    getEvents: async (params: {
        cursor?: string;
        limit?: number;
        status?: string;
        type?: string;
        communityId?: string
    }) => {
        const { data } = await api.get("/events", { params });
        return data.result;
    },

    getEventById: async (id: string) => {
        const { data } = await api.get(`/events/${id}`);
        return data.result;
    },

    createEvent: async (payload: CreateEventFormData) => {
        const { data } = await api.post("/events", payload);
        return data.result;
    },

    updateEvent: async (id: string, payload: Partial<CreateEventFormData> & { status?: string }) => {
        const { data } = await api.patch(`/events/${id}`, payload);
        return data.result;
    },

    registerForEvent: async (id: string, payload?: { teamName?: string; members?: string[] }) => {
        const { data } = await api.post(`/events/${id}/register`, payload);
        return data.result;
    },

    getLeaderboard: async (id: string) => {
        const { data } = await api.get(`/events/${id}/leaderboard`);
        return data.result;
    },

    deleteEvent: async (id: string) => {
        const { data } = await api.delete(`/events/${id}`);
        return data.result;
    },

    uploadEventImage: async (eventId: string, file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await api.post(`/events/${eventId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data.result;
    },

    removeEventImage: async (eventId: string): Promise<void> => {
        await api.delete(`/events/${eventId}/image`);
    },

    addEventProblem: async (eventId: string, data: { problemId: string; points: number; order: number }): Promise<void> => {
        await api.post(`/events/${eventId}/problems`, data);
    },

    removeEventProblem: async (eventId: string, problemId: string): Promise<void> => {
        await api.delete(`/events/${eventId}/problems/${problemId}`);
    },

    getEventPrizes: async (eventId: string) => {
        const { data } = await api.get(`/events/${eventId}/prizes`);
        return data.result;
    },

    getEventProblems: async (eventId: string) => {
        const { data } = await api.get(`/events/${eventId}/problems`);
        return data.result;
    },
};
