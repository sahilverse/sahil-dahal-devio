import { useMutation, useQuery } from "@tanstack/react-query";
import { PaymentService, type InitiatePaymentResponse } from "@/api/paymentService";
import { providers } from "@devio/zod-utils";
import { toast } from "sonner";

// ─── Cipher Purchase Initiation ───────────────────────────
export function useInitiateCipherPurchase() {
    return useMutation<
        InitiatePaymentResponse,
        { errorMessage?: string },
        { packageId: string; promoCode?: string }
    >({
        mutationFn: ({ packageId, promoCode }) =>
            PaymentService.initiateCipherPurchase(packageId, "ESEWA", promoCode),
        onError: (error) => {
            toast.error(error?.errorMessage || "Failed to initiate payment.");
        },
    });
}

// ─── Course Purchase Initiation ───────────────────────────
export function useInitiateCoursePurchase() {
    return useMutation<
        InitiatePaymentResponse,
        { errorMessage?: string },
        { courseId: string; provider: typeof providers[number]; promoCode?: string; cipherAmount?: number }
    >({
        mutationFn: ({ courseId, provider, promoCode, cipherAmount }) =>
            PaymentService.initiateCoursePurchase(courseId, provider, promoCode, cipherAmount),
        onError: (error) => {
            toast.error(error?.errorMessage || "Failed to initiate payment.");
        },
    });
}

// ─── Payment Verification ─────────────────────────────────

export function useVerifyPayment(encodedData: string | null) {
    return useQuery<
        { paymentId: string; status: string; ciphersAwarded: number; type: string; courseSlug?: string },
        { errorMessage?: string }
    >({
        queryKey: ["verify-payment", encodedData],
        queryFn: () => PaymentService.verify(encodedData!),
        enabled: !!encodedData,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 10,
        retry: false,
        throwOnError: true,
    });
}
