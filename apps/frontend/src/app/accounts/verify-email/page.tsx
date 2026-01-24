"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { verifyEmail } from "@/slices/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const token = searchParams?.get("token");
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const verifyCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid verification link");
            return;
        }

        if (verifyCalled.current) return;
        verifyCalled.current = true;

        const verify = async () => {
            try {
                await dispatch(verifyEmail({ token })).unwrap();
                setStatus("success");
                toast.success("Email verified successfully!");
            } catch (err: any) {
                setStatus("error");
                setErrorMessage("Failed to verify email. The link might be expired.");
            }
        };

        verify();
    }, [token, dispatch]);

    useEffect(() => {
        if (status === "success" || status === "error") {
            const duration = 3000;
            const interval = 30;
            const steps = duration / interval;
            const increment = 100 / steps;

            const timer = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + increment;
                    if (next >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return next;
                });
            }, interval);

            const redirectTimer = setTimeout(() => {
                router.push("/");
            }, duration);

            return () => {
                clearInterval(timer);
                clearTimeout(redirectTimer);
            };
        }
    }, [status, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center relative">
            {(status === "success" || status === "error") && (
                <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
                    <div
                        className="h-full bg-brand-primary transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {status === "verifying" && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
                    <h1 className="text-2xl font-bold">Verifying your email...</h1>
                    <p className="text-muted-foreground">Please wait while we verify your email address.</p>
                </div>
            )}

            {status === "success" && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Email Verified!</h1>
                    <p className="text-muted-foreground">
                        Your email has been successfully verified. Redirecting in a few seconds...
                    </p>
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-brand-primary hover:bg-brand-pressed text-white"
                    >
                        Go to Home Now
                    </Button>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Verification Failed</h1>
                    <p className="text-muted-foreground max-w-sm">
                        {errorMessage}
                    </p>
                    <p className="text-sm text-muted-foreground">Redirecting to home...</p>
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="cursor-pointer"
                    >
                        Back to Home Now
                    </Button>
                </div>
            )}
        </div>
    );
}
