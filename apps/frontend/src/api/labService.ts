import api from "./axios";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type VMStatus = "PENDING" | "RUNNING" | "STOPPED" | "TERMINATED";
export type CTFChallengeType = "INFO" | "FLAG" | "MULTIPLE_CHOICE";

export interface LabRoom {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: Difficulty;
    imageUrl: string | null;
    estimatedTime: number | null;
    pointsReward: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        challenges: number;
        enrollments: number;
    };
}

export interface LabsResponse {
    rooms: LabRoom[];
    total: number;
}

export interface LabEnrollment {
    id: string;
    roomId: string;
    userId: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    completedAt: string | null;
}

export interface CTFChallenge {
    id: string;
    roomId: string;
    title: string;
    description: string;
    type: CTFChallengeType;
    points: number;
    order: number;
    hints: string[];
    createdAt: string;
    updatedAt: string;
    isSolved?: boolean;
}

export interface VMSession {
    id: string;
    userId: string;
    roomId: string | null;
    instanceId: string | null;
    imageId: string | null;
    ipAddress: string | null;
    status: VMStatus;
    expiresAt: string;
    createdAt: string;
    startedAt: string | null;
}

export interface CTFSubmissionResult {
    isCorrect: boolean;
    message: string;
    pointsAwarded?: number;
}

export const LabService = {
    getRooms: async (params?: any): Promise<LabsResponse> => {
        const { data } = await api.get("/labs", { params });
        return data.result;
    },

    getRoomBySlug: async (slug: string): Promise<LabRoom> => {
        const { data } = await api.get(`/labs/${slug}`);
        return data.result;
    },

    joinRoom: async (roomId: string): Promise<LabEnrollment> => {
        const { data } = await api.post("/labs/join", { roomId });
        return data.result;
    },

    getEnrollment: async (roomId: string): Promise<LabEnrollment | null> => {
        const { data } = await api.get(`/labs/enrollment/${roomId}`);
        return data.result;
    },

    getChallenges: async (roomId: string): Promise<CTFChallenge[]> => {
        const { data } = await api.get(`/cyber-rooms/${roomId}/challenges`);
        return data.result;
    },

    submitFlag: async (challengeId: string, answer: string): Promise<CTFSubmissionResult> => {
        const { data } = await api.post(`/cyber-rooms/challenges/${challengeId}/submit`, { answer });
        return data.result;
    },

    startSession: async (roomId: string): Promise<VMSession> => {
        const { data } = await api.post("/cyber-rooms/session", { roomId });
        return data.result;
    },

    getActiveSession: async (roomId: string): Promise<VMSession | null> => {
        const { data } = await api.get(`/cyber-rooms/session/active/${roomId}`);
        return data.result;
    },

    extendSession: async (sessionId: string): Promise<VMSession> => {
        const { data } = await api.post(`/cyber-rooms/session/${sessionId}/extend`);
        return data.result;
    },

    terminateSession: async (sessionId: string): Promise<void> => {
        await api.post(`/cyber-rooms/session/${sessionId}/terminate`);
    },
};
