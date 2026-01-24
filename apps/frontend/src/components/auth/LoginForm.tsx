"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModal } from "./AuthModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/slices/auth";
import { toast } from "sonner";
import { OAuthButton } from "./OAuthButton";
import { LoginInput, loginSchema } from "@devio/zod-utils";

export function LoginForm() {
    const { switchToRegister, switchToForgotPassword, close } = useAuthModal();
    const dispatch = useAppDispatch();
    const { status } = useAppSelector((state) => state.auth);
    const isLoading = status === "loading";

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: LoginInput) => {
        try {
            await dispatch(login({ identifier: data.identifier, password: data.password })).unwrap();
            toast.success("Logged in successfully!");
            close();
            // OnboardingWatcher will automatically open the onboarding modal if needed
        } catch (err: any) {
            console.log(err);
            const { fieldErrors, errorMessage } = err;
            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, message]) => {
                    setError(field as keyof LoginInput, {
                        type: "manual",
                        message: message as string,
                    });
                });
            } else {
                setError("root", {
                    type: "manual",
                    message: errorMessage || "An error occurred during login. Please try again.",
                });
            }
        }
    };


    const handleGoogleLogin = () => {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const options = {
            redirect_uri: `${window.location.origin}/auth/google/callback`,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ].join(" "),
        };
        const qs = new URLSearchParams(options);
        window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    const handleGithubLogin = () => {
        const rootUrl = "https://github.com/login/oauth/authorize";
        const options = {
            client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string,
            redirect_uri: `${window.location.origin}/auth/github/callback`,
            scope: "user:email",
        };
        const qs = new URLSearchParams(options);
        window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Log In</h2>
                <p className="text-sm text-muted-foreground">
                    By continuing, you agree to our User Agreement and Privacy Policy.
                </p>
            </div>

            <div className="space-y-2">
                <OAuthButton provider="google" onClick={handleGoogleLogin} disabled={isLoading} />
                <OAuthButton provider="github" onClick={handleGithubLogin} disabled={isLoading} />
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        OR
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root?.message && (
                    <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-xs text-destructive text-center font-medium">
                        {errors.root.message}
                    </div>
                )}
                {/*  @ts-ignore */}
                {errors.account?.message && (
                    <div className="p-3 bg-destructive/15 border border-destructive/50 rounded-md text-xs text-destructive text-center font-medium">
                        {/*  @ts-ignore */}
                        {errors.account.message}
                    </div>
                )}
                <Input
                    label="Email or username"
                    type="text"
                    placeholder="Email or username"
                    error={errors.identifier?.message}
                    {...register("identifier")}
                    disabled={isLoading}
                />
                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Password"
                        error={errors.password?.message}
                        {...register("password")}
                        disabled={isLoading}
                    />
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={switchToForgotPassword}
                            className="text-xs font-medium text-brand-primary hover:underline cursor-pointer"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-pressed text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || (!isValid && !errors.root && !(errors as any).account)}
                >
                    {isLoading ? "Logging in..." : "Log in"}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                New to Dev.io?{" "}
                <button
                    onClick={switchToRegister}
                    className="font-medium text-brand-primary hover:underline transition-colors cursor-pointer"
                    type="button"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
}
