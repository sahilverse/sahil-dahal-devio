"use client";

import { useAppDispatch } from "@/store/hooks";
import { verifyEmail } from "@/slices/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTokenVerifier } from "@/hooks/use-token-verifier";
import { useAutoRedirect } from "@/hooks/use-auto-redirect";
import { useEffect } from "react";

export default function VerifyEmailPage() {
    const router = useRouter();

    const { status, error, setStatus } = useTokenVerifier({
        action: verifyEmail,
        successMessage: "Email verified successfully!",
        errorMessage: "Failed to verify email. The link might be expired."
    });

    useEffect(() => {
        if (status === "verified") {
            setStatus("success");
        }
    }, [status, setStatus]);

    const { progress } = useAutoRedirect({
        shouldRedirect: status === "success" || status === "error",
        to: "/"
    });

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
                        {error}
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
