import { useMutation, useQuery } from "@tanstack/react-query";
import { PaymentService, type InitiatePaymentResponse } from "@/api/paymentService";
import { toast } from "sonner";

// ─── Payment Initiation ───────────────────────────────────

export function useInitiatePayment() {
    return useMutation<
        InitiatePaymentResponse,
        { errorMessage?: string },
        { packageId: string; promoCode?: string }
    >({
        mutationFn: ({ packageId, promoCode }) =>
            PaymentService.initiate(packageId, "ESEWA", promoCode),
        onError: (error) => {
            toast.error(error?.errorMessage || "Failed to initiate payment.");
        },
    });
}

// ─── Payment Verification ─────────────────────────────────

export function useVerifyPayment(encodedData: string | null) {
    return useQuery<
        { paymentId: string; status: string; ciphersAwarded: number },
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
