"use client";

import { Coins } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <Coins className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Verifying Payment</h2>
                <p className="text-muted-foreground animate-pulse">Processing through secure servers...</p>
            </div>
        </div>
    );
}
