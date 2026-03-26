"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessStateProps {
    data: {
        ciphersAwarded: number;
        paymentId: string;
    };
    countdown: number;
    onDashboard: () => void;
    onStore: () => void;
}

export function SuccessState({ data, countdown, onDashboard, onStore }: SuccessStateProps) {
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
