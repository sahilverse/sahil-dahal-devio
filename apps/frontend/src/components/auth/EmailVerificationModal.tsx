"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmail, sendVerificationEmail } from "@/slices/auth";
import { toast } from "sonner";

const otpSchema = z.object({
    token: z
        .string()
        .length(6, "Please enter the 6-digit code")
        .regex(/^\d+$/, "Code must be numbers only"),
});

type OTPInput = z.infer<typeof otpSchema>;

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EmailVerificationModal({ isOpen, onClose }: EmailVerificationModalProps) {
    const dispatch = useAppDispatch();
    const { user, status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";
    const [resending, setResending] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<OTPInput>({
        resolver: zodResolver(otpSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: OTPInput) => {
        if (!user?.email) return;

        try {
            await dispatch(verifyEmail({ email: user.email, token: data.token })).unwrap();
            toast.success("Email verified successfully!");
            onClose();
        } catch (err: any) {
            const message = err?.errorMessage || "Invalid or expired code";
            setError("token", { type: "manual", message });
        }
    };

    const handleResend = async () => {
        if (!user?.email || resending) return;

        setResending(true);
        try {
            await dispatch(sendVerificationEmail(user.email)).unwrap();
            toast.success("Verification code sent!");
        } catch (err: any) {
            toast.error(err?.errorMessage || "Failed to send code");
        } finally {
            setResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-6 md:p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                    <div className="space-y-2 text-center">
                        <h2 className="text-xl font-semibold tracking-tight">Verify Your Email</h2>
                        <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to <span className="font-medium text-foreground">{user?.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Verification Code"
                            placeholder="123456"
                            maxLength={6}
                            error={errors.token?.message}
                            {...register("token")}
                            disabled={isLoading}
                            autoFocus
                            className="text-center text-lg tracking-widest"
                        />

                        <Button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Email"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Didn't receive the code?{" "}
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="font-medium text-brand-primary hover:underline transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {resending ? "Sending..." : "Resend"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
