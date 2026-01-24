"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "@/api/axios";

import { Provider } from "react-redux";
import { store } from "@/store";
import { setAccessToken, setUser } from "@/slices/auth";
import { startRefreshing, stopRefreshing, processQueue } from "@/api/refreshQueue";
import { AuthModalProvider, AuthModal } from "@/components/auth";
import { OnboardingModalProvider, OnboardingModal, OnboardingWatcher } from "@/components/onboarding";
import ThemedToaster from "@/components/ThemedToaster";
import { logout } from "@/lib/auth";

interface ProvidersProps {
    children: React.ReactNode;
    token?: boolean;
}

export function Providers({ children, token }: ProvidersProps) {
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setAuthReady(true);
                return;
            }

            startRefreshing();
            try {
                const { data } = await api.post("/auth/token/refresh");
                const { access_token, user } = data.result;

                store.dispatch(setAccessToken(access_token));
                store.dispatch(setUser(user));
                processQueue(null, access_token);
            } catch {
                processQueue(null, null);
                logout();
            } finally {
                stopRefreshing();
                setAuthReady(true);
            }
        };

        initAuth();
    }, [token]);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { retry: 1, refetchOnWindowFocus: false },
                    mutations: { retry: 0 },
                },
            })
    );

    if (!authReady) return null;

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AuthModalProvider>
                    <OnboardingModalProvider>
                        {children}
                        <AuthModal />
                        <OnboardingModal />
                        <OnboardingWatcher />
                        <ThemedToaster />
                    </OnboardingModalProvider>
                </AuthModalProvider>
            </QueryClientProvider>
        </Provider>
    );
}
