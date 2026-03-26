import api from "./axios";

// ─── Types ─────────────────────────────────────────────────

export interface PromoValidationResult {
    id: string;
    code: string;
    discount: number;
    type: string;
}

// ─── Promo API ─────────────────────────────────────────────

export const PromoService = {
    validate: async (code: string, packageId?: string): Promise<PromoValidationResult> => {
        const { data } = await api.post("/promo-codes/validate", {
            code,
            ...(packageId && { packageId }),
        });
        return data.result;
    },
};
