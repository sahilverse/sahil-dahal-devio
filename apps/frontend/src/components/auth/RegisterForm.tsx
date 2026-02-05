"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerUser, sendVerificationEmail, login } from "@/slices/auth";
import { toast } from "sonner";
import { OAuthButton } from "./OAuthButton";
import { ChevronLeft } from "lucide-react";
import { registerSchema, RegisterInput } from "@devio/zod-utils";
import { useOAuthHandlers } from "@/hooks/useOAuthHandlers";

export function RegisterForm() {
    const [step, setStep] = useState(1);
    const { switchToLogin, switchToVerifyEmail } = useAuthModal();
    const dispatch = useAppDispatch();
    const { status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";
    const { handleGoogleLogin, handleGithubLogin } = useOAuthHandlers();

    const {
        register,
        handleSubmit,
        trigger,
        setError,
        clearErrors,
        getValues,
        formState: { errors, isValid, dirtyFields },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched",
    });

    const handlePasswordBlur = async () => {
        const confirmPassword = getValues("confirmPassword");
        if (confirmPassword) {
            await trigger("confirmPassword");
        }
    };

    const handleConfirmPasswordBlur = async () => {
        const password = getValues("password");
        const confirmPassword = getValues("confirmPassword");
        if (password && confirmPassword) {
            await trigger("confirmPassword");
        }
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof RegisterInput)[] = [];
        if (step === 1) fieldsToValidate = ["email"];
        if (step === 2) fieldsToValidate = ["username"];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            clearErrors();
            setStep((prev) => prev + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && step !== 3) {
            e.preventDefault();
            handleNext();
        }
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const onSubmit = async (data: RegisterInput) => {
        try {
            await dispatch(registerUser({
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                confirmPassword: data.confirmPassword
            })).unwrap();

            await dispatch(login({
                identifier: data.email,
                password: data.password
            })).unwrap();

            toast.success("Signed in successfully!");
            window.location.reload();

            await dispatch(sendVerificationEmail(data.email)).unwrap();

            switchToVerifyEmail();
        } catch (err: any) {
            console.log(err);
            const { fieldErrors, errorMessage } = err || {};

            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof RegisterInput, {
                        type: "manual",
                        message: message as string,
                    });

                    if (field === "email") setStep(1);
                    if (field === "username") setStep(2);
                });
            } else if (errorMessage) {
                if (errorMessage.toLowerCase().includes("email")) {
                    setError("email", { type: "manual", message: errorMessage });
                    setStep(1);
                } else if (errorMessage.toLowerCase().includes("username")) {
                    setError("username", { type: "manual", message: errorMessage });
                    setStep(2);
                } else {
                    setError("root", { type: "manual", message: errorMessage });
                }
            } else {
                setError("root", {
                    type: "manual",
                    message: "An error occurred during registration. Please try again."
                });
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {step > 1 ? (
                    <button
                        onClick={handleBack}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 -ml-1 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </button>
                ) : null}
                <h2 className="text-xl font-semibold tracking-tight text-center">Sign Up</h2>
                <p className="text-sm text-muted-foreground text-center">
                    {step === 1 && "Enter your email to get started."}
                    {step === 2 && "Choose a username for your profile."}
                    {step === 3 && "Finish setting up your account."}
                </p>
            </div>

            {step === 1 && (
                <div className="space-y-2">
                    <OAuthButton provider="google" onClick={handleGoogleLogin} disabled={isLoading} />
                    <OAuthButton provider="github" onClick={handleGithubLogin} disabled={isLoading} />

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                OR
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-3">
                {errors.root?.message && (
                    <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-xs text-destructive text-center font-medium">
                        {errors.root.message}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Email"
                            error={errors.email?.message}
                            {...register("email")}
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!dirtyFields.email || !!errors.email}
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                            label="Username"
                            placeholder="Username"
                            error={errors.username?.message}
                            {...register("username")}
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!dirtyFields.username || !!errors.username}
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="First Name"
                                placeholder="First Name"
                                error={errors.firstName?.message}
                                {...register("firstName")}
                                disabled={isLoading}
                                autoFocus
                            />
                            <Input
                                label="Last Name"
                                placeholder="Last Name"
                                error={errors.lastName?.message}
                                {...register("lastName")}
                                disabled={isLoading}
                            />
                        </div>

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Password"
                            error={errors.password?.message}
                            {...register("password", { onBlur: handlePasswordBlur })}
                            disabled={isLoading}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword", { onBlur: handleConfirmPasswordBlur })}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </div>
                )}

            </form>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                    onClick={switchToLogin}
                    className="font-medium text-brand-primary hover:underline transition-colors cursor-pointer"
                    type="button"
                >
                    Log in
                </button>
            </div>
        </div>
    );
}
