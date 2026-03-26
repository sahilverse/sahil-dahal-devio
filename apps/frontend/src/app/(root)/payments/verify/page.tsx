"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ShoppingBag, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useVerifyPayment } from "@/hooks/usePayment";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


function LoadingState() {
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

function SuccessState({ data, countdown, onDashboard, onStore }: { data: any, countdown: number, onDashboard: () => void, onStore: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
        >
            <Card className="max-w-md w-full border-brand-primary/20 shadow-xl overflow-hidden">
                <div className="h-2 bg-brand-primary" />
                <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Payment Success!</h2>
                        <p className="text-muted-foreground">Your transaction was verified successfully.</p>
                        <p className="text-xs text-brand-primary font-medium animate-pulse">
                            Redirecting to dashboard in {countdown}s...
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-2xl p-6 border border-default space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Amount Added</span>
                            <span className="text-xl font-bold text-brand-primary flex items-center gap-1">
                                <Coins className="w-5 h-5" />
                                {data.ciphersAwarded} Ciphers
                            </span>
                        </div>
                        <div className="h-px bg-default" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Payment ID</span>
                            <span className="text-xs font-mono bg-background px-2 py-1 rounded border border-default truncate max-w-[150px]">
                                {data.paymentId}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button variant="brand" className="w-full h-12 text-base font-bold" onClick={onDashboard}>
                            Continue to Dashboard
                        </Button>
                        <Button variant="outline" className="w-full h-11" onClick={onStore}>
                            Back to Store
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ErrorState({ error, onStore, onExplore }: { error?: any, onStore: () => void, onExplore: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20 animate-in zoom-in duration-300">
                <XCircle className="w-10 h-10" />
            </div>

            <div className="text-center space-y-3 max-w-sm">
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-muted-foreground">
                    {error?.errorMessage || "We couldn't verify your payment with the provider. Please contact support if your balance isn't updated."}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button variant="brand" className="flex-1 h-11" onClick={onStore}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Back to Store
                </Button>
                <Button variant="outline" className="flex-1 h-11" onClick={onExplore}>
                    Explore Problems
                </Button>
            </div>
        </div>
    );
}

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dataParam = searchParams.get("data");

    const {
        data,
        isLoading: isPending,
        error: verifyError
    } = useVerifyPayment(dataParam);

    const [countdown, setCountdown] = useState(10);
    const qc = useQueryClient();

    // Handle Success Side Effects
    useEffect(() => {
        if (data && data.status === "COMPLETED") {
            toast.success(`${data.ciphersAwarded} Ciphers added!`);
            qc.invalidateQueries({ queryKey: ["cipher-balance"] });
        }
    }, [data, qc]);

    // Handle Countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (data && data.status === "COMPLETED" && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [data, countdown]);

    // Handle Redirect
    useEffect(() => {
        if (countdown === 0 && data?.status === "COMPLETED") {
            router.push("/");
        }
    }, [countdown, data, router]);

    // ─── Render ─────────────────────────────────────
    if (isPending) return <LoadingState />;

    if (data && data.status === "COMPLETED") {
        return (
            <SuccessState
                data={data}
                countdown={countdown}
                onDashboard={() => router.push("/")}
                onStore={() => router.push("/ciphers")}
            />
        );
    }

    return (
        <ErrorState
            error={verifyError ?? undefined}
            onStore={() => router.push("/ciphers")}
            onExplore={() => router.push("/problems")}
        />
    );
}

export default function VerificationPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
