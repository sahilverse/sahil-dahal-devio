import { useMutation } from "@tanstack/react-query";
import { PromoService, type PromoValidationResult } from "@/api/promoService";

// ─── Promo Code Validation ─────────────────────────────────

export function useValidatePromo() {
    return useMutation<
        PromoValidationResult,
        { errorMessage?: string },
        { code: string; packageId?: string }
    >({
        mutationFn: ({ code, packageId }) => PromoService.validate(code, packageId),
    });
}
