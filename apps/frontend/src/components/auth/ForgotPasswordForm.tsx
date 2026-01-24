"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModal } from "./AuthModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forgotPassword, verifyResetToken, resetPassword } from "@/slices/auth";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import { resetPasswordSchema } from "@devio/zod-utils";

const identifierSchema = z.object({
    identifier: z.string().min(1, "Email or Username is required"),
});

const otpSchema = z.object({
    token: z.string().length(6, "Code must be 6 digits"),
});


type IdentifierInput = z.infer<typeof identifierSchema>;
type OTPInput = z.infer<typeof otpSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordForm() {
    const [step, setStep] = useState(1);
    const { switchToLogin, close } = useAuthModal();
    const dispatch = useAppDispatch();
    const { status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";
    const [identifier, setIdentifier] = useState("");

    // Step 1: Identifier Form
    const {
        register: registerIdentifier,
        handleSubmit: handleSubmitIdentifier,
        setError: setErrorIdentifier,
        formState: { errors: errorsIdentifier },
    } = useForm<IdentifierInput>({
        resolver: zodResolver(identifierSchema),
    });

    // Step 2: OTP Form
    const {
        register: registerOTP,
        handleSubmit: handleSubmitOTP,
        setError: setErrorOTP,
        formState: { errors: errorsOTP },
    } = useForm<OTPInput>({
        resolver: zodResolver(otpSchema),
    });

    // Step 3: Reset Password Form
    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        setError: setErrorReset,
        formState: { errors: errorsReset },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onIdentifierSubmit = async (data: IdentifierInput) => {
        try {
            await dispatch(forgotPassword({ identifier: data.identifier })).unwrap();
            setIdentifier(data.identifier);
            toast.success("Verification code sent!");
            setStep(2);
        } catch (err: any) {
            setErrorIdentifier("identifier", {
                type: "manual",
                message: err?.errorMessage || "Failed to send code",
            });
        }
    };

    const onOTPSubmit = async (data: OTPInput) => {
        try {
            await dispatch(verifyResetToken({ token: data.token, identifier })).unwrap();
            setStep(3);
        } catch (err: any) {
            setErrorOTP("token", {
                type: "manual",
                message: err?.errorMessage || "Invalid code",
            });
        }
    };

    const onResetSubmit = async (data: ResetPasswordInput) => {
        try {
            await dispatch(resetPassword({
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword
            })).unwrap();
            toast.success("Password reset successfully!");
            close();
            switchToLogin();
        } catch (err: any) {
            setErrorReset("root", {
                type: "manual",
                message: err?.errorMessage || "Failed to reset password",
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <button
                    onClick={step === 1 ? switchToLogin : () => setStep((p) => p - 1)}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 -ml-1 cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </button>
                <h2 className="text-xl font-semibold tracking-tight text-center">
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Verify Code"}
                    {step === 3 && "Reset Password"}
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                    {step === 1 && "Enter your email or username to receive a verification code."}
                    {step === 2 && `Enter the 6-digit code sent to ${identifier}.`}
                    {step === 3 && "Create a new password for your account."}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleSubmitIdentifier(onIdentifierSubmit)} className="space-y-4">
                    <Input
                        label="Email or Username"
                        placeholder="Enter email or username"
                        error={errorsIdentifier.identifier?.message}
                        {...registerIdentifier("identifier")}
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-pressed text-white cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Code"}
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmitOTP(onOTPSubmit)} className="space-y-4">
                    <Input
                        label="Verification Code"
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        error={errorsOTP.token?.message}
                        {...registerOTP("token")}
                        disabled={isLoading}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-pressed text-white cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
                    </Button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="New Password"
                        error={errorsReset.newPassword?.message}
                        {...registerReset("newPassword")}
                        disabled={isLoading}
                        autoFocus
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm Password"
                        error={errorsReset.confirmNewPassword?.message}
                        {...registerReset("confirmNewPassword")}
                        disabled={isLoading}
                    />
                    {errorsReset.root?.message && (
                        <p className="text-sm text-destructive text-center">{errorsReset.root.message}</p>
                    )}
                    <Button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-pressed text-white cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
                    </Button>
                </form>
            )}
        </div>
    );
}
