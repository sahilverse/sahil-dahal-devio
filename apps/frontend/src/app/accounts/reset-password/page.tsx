"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { verifyResetToken, resetPassword } from "@/slices/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordSchema } from "@devio/zod-utils";

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const token = searchParams?.get("token");
    const [status, setStatus] = useState<"verifying" | "verified" | "success" | "error">("verifying");
    const [errorMessage, setErrorMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const verifyCalled = useRef(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid reset link");
            return;
        }

        if (verifyCalled.current) return;
        verifyCalled.current = true;

        const verify = async () => {
            try {
                await dispatch(verifyResetToken({ token })).unwrap();
                setStatus("verified");
                toast.success("Token verified. Please set a new password.");
            } catch (err: any) {
                setStatus("error");
                setErrorMessage(err?.errorMessage || "Invalid or expired reset token.");
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
                router.replace("/");
            }, duration);

            return () => {
                clearInterval(timer);
                clearTimeout(redirectTimer);
            };
        }
    }, [status, router]);

    const onSubmit = async (data: ResetPasswordInput) => {
        try {
            await dispatch(resetPassword({
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword
            })).unwrap();

            setStatus("success");
            toast.success("Password reset successfully!");
        } catch (err: any) {
            setError("root", {
                type: "manual",
                message: err?.errorMessage || "Failed to reset password",
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto relative">
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
                    <h1 className="text-2xl font-bold">Verifying link...</h1>
                    <p className="text-muted-foreground">Please wait while we verify your password reset link.</p>
                </div>
            )}

            {status === "verified" && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300 text-left">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Reset Password</h1>
                        <p className="text-muted-foreground">Enter your new password below.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="New Password"
                            error={errors.newPassword?.message}
                            {...register("newPassword")}
                            disabled={isSubmitting}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            error={errors.confirmNewPassword?.message}
                            {...register("confirmNewPassword")}
                            disabled={isSubmitting}
                        />
                        {errors.root?.message && (
                            <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-xs text-destructive text-center font-medium">
                                {errors.root.message}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
                        </Button>
                    </form>
                </div>
            )}

            {status === "success" && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Password Reset!</h1>
                    <p className="text-muted-foreground">
                        Your password has been successfully reset. Redirecting to home...
                    </p>
                    <Button
                        onClick={() => router.replace("/")}
                        className="bg-brand-primary hover:bg-brand-pressed text-white cursor-pointer"
                    >
                        Go to Home
                    </Button>
                </div>
            )}

            {status === "error" && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Invalid Link</h1>
                    <p className="text-muted-foreground max-w-sm">
                        {errorMessage}
                    </p>
                    <p className="text-sm text-muted-foreground">Redirecting to home...</p>
                    <Button
                        onClick={() => router.replace("/")}
                        variant="outline"
                        className="cursor-pointer"
                    >
                        Back to Home
                    </Button>
                </div>
            )}
        </div>
    );
}
