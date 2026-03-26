"use client";

import { useRouter } from "next/navigation";
import { XCircle, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "motion/react";
import { PaymentSession } from "@/lib/payment-session";
import { useEffect } from "react";
import { PaymentGuard } from "@/components/shared/PaymentGuard";

export default function PaymentFailedPage() {
    const router = useRouter();

    useEffect(() => {
        PaymentSession.clear();
    }, []);

    return (
        <PaymentGuard>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <Card className="border-destructive/20 shadow-lg">
                        <CardHeader className="text-center pb-2">
                            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/20">
                                <XCircle className="w-10 h-10" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-destructive">Payment Failed</CardTitle>
                            <CardDescription>The transaction was cancelled or could not be processed.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-4 text-center">
                            <div className="bg-muted/50 p-4 rounded-xl border border-default flex items-start gap-3 text-left mb-2">
                                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">What happened?</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Possible reasons include insufficient funds, daily transaction limits, or a manual cancellation at the payment gateway.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Don't worry, no funds have been deducted from your account if the transaction was cancelled.
                            </p>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 pt-2 pb-8 px-8">
                            <Button
                                variant="brand"
                                className="w-full h-11 font-bold"
                                onClick={() => router.push("/ciphers")}
                            >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => router.push("/")}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Return to Dashboard
                            </Button>
                        </CardFooter>
                    </Card>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        If you believe this is an error, please reach out to our support team with your transaction ID.
                    </p>
                </motion.div>
            </div>
        </PaymentGuard>
    );
}
