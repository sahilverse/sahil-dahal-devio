"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { useCipherBalance } from "@/hooks/useCipher";

export default function CipherBalanceButton() {
    const { data: balance, isLoading } = useCipherBalance();

    if (isLoading) {
        return (
            <div className="w-[88px] h-8 bg-brand-primary/10 animate-pulse rounded-full border border-brand-primary/20" />
        );
    }

    if (balance === undefined) return null;

    return (
        <Link
            href="/ciphers"
            className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 lg:px-4 py-1.5 rounded-full hover:bg-brand-primary/20 transition-colors font-medium text-sm border border-brand-primary/20 cursor-pointer shrink-0"
            title="Go to Store"
        >
            <Coins className="w-4 h-4" />
            <span className="font-bold tracking-tight">
                {Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(balance)}
            </span>
        </Link>
    );
}
