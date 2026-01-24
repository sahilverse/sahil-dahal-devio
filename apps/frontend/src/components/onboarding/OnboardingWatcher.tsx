"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useOnboardingModal } from "./OnboardingModalContext";
import { needsOnboarding } from "@/lib/onboarding";

export function OnboardingWatcher() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { open, isOpen } = useOnboardingModal();

    useEffect(() => {
        if (user && needsOnboarding(user) && !isOpen) {
            open();
            const onboardingParam = searchParams?.get("onboarding");
            if (onboardingParam) {
                router.replace("/", { scroll: false });
            }
        }
    }, [user, isOpen, open, searchParams, router]);

    return null;
}
