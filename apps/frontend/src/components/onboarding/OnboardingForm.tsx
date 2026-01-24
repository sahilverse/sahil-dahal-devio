"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingModal } from "./OnboardingModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { completeOnboarding } from "@/slices/auth";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { onboardingSchema, OnboardingInput } from "@devio/zod-utils";

export function OnboardingForm() {
    const { close } = useOnboardingModal();
    const dispatch = useAppDispatch();
    const { user, status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        setError,
        formState: { errors },
    } = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema),
        mode: "onChange",
        defaultValues: {
            username: user?.username || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    const username = watch("username");
    const firstName = watch("firstName");
    const lastName = watch("lastName");

    const handleNextStep = async () => {
        const isValid = await trigger("username");
        if (isValid) {
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const onSubmit = async (data: OnboardingInput) => {
        try {
            await dispatch(completeOnboarding(data)).unwrap();
            toast.success("Profile completed successfully!");
            close();
        } catch (err: any) {
            console.error("Onboarding error:", err);
            const { fieldErrors, errorMessage } = err || {};
            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof OnboardingInput, {
                        type: "manual",
                        message: message as string,
                    });
                    if (field === "username") {
                        setStep(1);
                    }
                });
            } else {
                toast.error(errorMessage || "Failed to complete profile. Please try again.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Complete Your Profile</h2>
                <p className="text-sm text-muted-foreground">
                    Just a few more details to get you started
                </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step >= 1 ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <div className={`w-12 h-0.5 transition-colors ${step >= 2 ? "bg-brand-primary" : "bg-muted"
                    }`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step >= 2 ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                    2
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1: Username */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-center">Choose your username</p>
                            <p className="text-xs text-muted-foreground text-center">
                                This will be your unique identifier on Dev.io
                            </p>
                        </div>
                        <Input
                            label="Username"
                            type="text"
                            placeholder="your_username"
                            error={errors.username?.message}
                            {...register("username")}
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !username || !!errors.username}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Step 2: Name */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-center">What's your name?</p>
                            <p className="text-xs text-muted-foreground text-center">
                                Help others recognize you
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="First Name"
                                type="text"
                                placeholder="John"
                                error={errors.firstName?.message}
                                {...register("firstName")}
                                disabled={isLoading}
                                autoFocus
                            />
                            <Input
                                label="Last Name"
                                type="text"
                                placeholder="Doe"
                                error={errors.lastName?.message}
                                {...register("lastName")}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={handlePrevStep}
                                variant="outline"
                                className="flex-1 cursor-pointer"
                                disabled={isLoading}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || !firstName || !lastName || !!errors.firstName || !!errors.lastName}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Complete"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
