import api from "./axios";
import { providers } from "@devio/zod-utils";
// ─── Types ─────────────────────────────────────────────────

export interface EsewaConfig {
    amount: number;
    tax_amount: number;
    total_amount: number;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: number;
    product_delivery_charge: number;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export interface InitiatePaymentResponse {
    enrolled: boolean;
    courseSlug?: string;
    paymentId?: string;
    gatewayConfig?: Record<string, any>;
    gatewayUrl?: string;
    provider?: string;
}

export interface VerifyPaymentResponse {
    paymentId: string;
    status: string;
    ciphersAwarded: number;
    type: string;
    courseSlug?: string;
}

// ─── Payment API ───────────────────────────────────────────

export const PaymentService = {
    initiateCipherPurchase: async (packageId: string, provider: typeof providers[number], promoCode?: string): Promise<InitiatePaymentResponse> => {
        const { data } = await api.post("/payments/initiate/cipher", {
            packageId,
            provider,
            ...(promoCode && { promoCode }),
        });
        return data.result;
    },

    initiateCoursePurchase: async (
        courseId: string,
        provider: typeof providers[number],
        promoCode?: string,
        cipherAmount?: number
    ): Promise<InitiatePaymentResponse> => {
        const { data } = await api.post("/payments/initiate/course", {
            courseId,
            provider,
            ...(promoCode && { promoCode }),
            ...(cipherAmount && { cipherAmount }),
        });
        return data.result;
    },

    verify: async (encodedData: string): Promise<VerifyPaymentResponse> => {
        const { data } = await api.get("/payments/verify/esewa", {
            params: { data: encodedData },
        });
        return data.result;
    },
};
