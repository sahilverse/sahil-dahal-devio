"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModal } from "./AuthModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerUser } from "@/slices/auth";
import { toast } from "sonner";
import { OAuthButton } from "./OAuthButton";
import { ChevronLeft } from "lucide-react";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const [step, setStep] = useState(1);
    const { switchToLogin, close } = useAuthModal();
    const dispatch = useAppDispatch();
    const { status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        formState: { errors, isValid },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
    });

    const email = watch("email");
    const username = watch("username");

    const handleNext = async () => {
        let fieldsToValidate: (keyof RegisterFormData)[] = [];
        if (step === 1) fieldsToValidate = ["email"];
        if (step === 2) fieldsToValidate = ["username"];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const onSubmit = async (data: RegisterFormData) => {
        const result = await dispatch(registerUser({
            username: data.username,
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            confirmPassword: data.confirmPassword
        }));

        if (registerUser.fulfilled.match(result)) {
            toast.success("Account created! Please log in.");
            switchToLogin();
        } else {
            toast.error(result.payload?.errorMessage || "Failed to register");
        }
    };

    const handleGoogleLogin = () => {
        toast.info("Google login implementation pending");
    };

    const handleGithubLogin = () => {
        toast.info("GitHub login implementation pending");
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

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
                            disabled={!email || !!errors.email}
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
                            disabled={!username || !!errors.username}
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
                            {...register("password")}
                            disabled={isLoading}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
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
