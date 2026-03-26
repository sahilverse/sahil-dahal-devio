import api from "./axios";

// ─── Types ─────────────────────────────────────────────────

export interface CipherPackage {
    id: string;
    name: string;
    description: string;
    points: number;
    price: number;
    currency: string;
    isFeatured: boolean;
    isActive: boolean;
}

// ─── Cipher API ────────────────────────────────────────────

export const CipherService = {
    getPackages: async (): Promise<CipherPackage[]> => {
        const { data } = await api.get("/cipher/packages");
        return data.result;
    },

    getBalance: async (): Promise<number> => {
        const { data } = await api.get("/cipher/balance");
        return data.result.balance;
    },

    getHistory: async (limit = 20, cursor?: string) => {
        const { data } = await api.get("/cipher/history", {
            params: { limit, cursor },
        });
        return data.result;
    },
};
