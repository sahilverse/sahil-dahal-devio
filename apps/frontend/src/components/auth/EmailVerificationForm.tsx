"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmail, sendVerificationEmail } from "@/slices/auth";
import { toast } from "sonner";
import { useAuthModal } from "../../contexts/AuthModalContext";

const otpSchema = z.object({
    token: z
        .string()
        .length(6, "Please enter the 6-digit code")
        .regex(/^\d+$/, "Code must be numbers only"),
});

type OTPInput = z.infer<typeof otpSchema>;

export function EmailVerificationForm() {
    const dispatch = useAppDispatch();
    const { close } = useAuthModal();
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
            close();
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

    const handleSkip = () => {
        close();
    };

    return (
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

            <div className="flex flex-col items-center gap-2 text-sm">
                <div className="text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="font-medium text-brand-primary hover:underline transition-colors cursor-pointer disabled:opacity-50"
                        type="button"
                    >
                        {resending ? "Sending..." : "Resend"}
                    </button>
                </div>

                <button
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    type="button"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
