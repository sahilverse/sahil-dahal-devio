import { useQuery } from "@tanstack/react-query";
import { CipherService, type CipherPackage } from "@/api/cipherService";

// ─── Packages ──────────────────────────────────────────────

export function useCipherPackages() {
    return useQuery<CipherPackage[]>({
        queryKey: ["cipher-packages"],
        queryFn: CipherService.getPackages,
        staleTime: 5 * 60 * 1000, // 5 min — packages rarely change
    });
}

// ─── Balance ───────────────────────────────────────────────

export function useCipherBalance() {
    return useQuery<number>({
        queryKey: ["cipher-balance"],
        queryFn: CipherService.getBalance,
    });
}
