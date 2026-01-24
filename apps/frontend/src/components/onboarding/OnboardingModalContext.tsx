"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingModalContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const OnboardingModalContext = createContext<OnboardingModalContextType | undefined>(undefined);

export function OnboardingModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <OnboardingModalContext.Provider value={{
            isOpen,
            open,
            close,
        }}>
            {children}
        </OnboardingModalContext.Provider>
    );
}

export function useOnboardingModal() {
    const context = useContext(OnboardingModalContext);
    if (context === undefined) {
        throw new Error('useOnboardingModal must be used within a OnboardingModalProvider');
    }
    return context;
}
