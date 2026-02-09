"use client";

import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { googleOAuth, githubOAuth } from "@/slices/auth";
import { toast } from "sonner";
import { capitalize } from "@/lib/string";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const processedRef = useRef(false);

    const provider = params?.provider as string;
    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    useEffect(() => {
        if (processedRef.current) return;

        if (error) {
            processedRef.current = true;
            toast.error("Authentication rejected");
            router.push("/");
            return;
        }

        if (!code || !provider) {
            return;
        }

        const handleOAuth = async () => {
            processedRef.current = true;
            try {
                let action;
                if (provider === "google") {
                    action = googleOAuth(code);
                } else if (provider === "github") {
                    action = githubOAuth(code);
                } else {
                    toast.error("Invalid provider");
                    router.push("/");
                    return;
                }

                await dispatch(action).unwrap();
                toast.success(`Successfully logged in with ${capitalize(provider)}`);
                router.push("/");
            } catch (err: any) {
                console.error("OAuth Error:", err);
                const message = err.errorMessage || "Authentication failed";
                toast.error(message);
                router.push("/");
            }
        };

        handleOAuth();
    }, [code, provider, dispatch, router, error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            <p className="mt-4 text-muted-foreground capitalize">Authenticating with {provider}...</p>
        </div>
    );
}
