"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthModalContextType {
    isOpen: boolean;
    view: AuthView;
    openLogin: () => void;
    openRegister: () => void;
    close: () => void;
    switchToRegister: () => void;
    switchToLogin: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<AuthView>('login');

    const openLogin = () => {
        setView('login');
        setIsOpen(true);
    };

    const openRegister = () => {
        setView('register');
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const switchToRegister = () => setView('register');
    const switchToLogin = () => setView('login');

    return (
        <AuthModalContext.Provider value={{
            isOpen,
            view,
            openLogin,
            openRegister,
            close,
            switchToRegister,
            switchToLogin
        }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within a AuthModalProvider');
    }
    return context;
}
