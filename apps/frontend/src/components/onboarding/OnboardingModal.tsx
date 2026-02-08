"use client";

import { useOnboardingModal } from "./OnboardingModalContext";
import { OnboardingForm } from "./OnboardingForm";

export function OnboardingModal() {
    const { isOpen } = useOnboardingModal();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop - No close on click since this is required */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200" />

            {/* Modal Content */}
            <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-6 md:p-8 max-h-[90vh] overflow-y-auto cursor-default">
                {/* No close button - user must complete onboarding */}
                <OnboardingForm />
            </div>
        </div>
    );
}
