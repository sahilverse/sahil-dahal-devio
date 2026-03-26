"use client";

import { XCircle, ShoppingBag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PaymentSession } from "@/lib/payment-session";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string; errorMessage?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        PaymentSession.clear();
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20 animate-in zoom-in duration-300">
                <XCircle className="w-10 h-10" />
            </div>

            <div className="text-center space-y-3 max-w-sm">
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-muted-foreground">
                    {error?.errorMessage || error?.message || "We couldn't verify your payment with the provider. Please contact support if your balance isn't updated."}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button variant="brand" className="flex-1 h-11" onClick={() => router.push("/ciphers")}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Back to Store
                </Button>
                <Button variant="outline" className="flex-1 h-11" onClick={() => reset()}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
