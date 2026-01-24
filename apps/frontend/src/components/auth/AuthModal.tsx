"use client";

import { useAuthModal } from "./AuthModalContext";
import { X } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function AuthModal() {
    const { isOpen, close, view } = useAuthModal();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={close}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-6 md:p-8 max-h-[90vh] overflow-y-auto cursor-default">
                <button
                    onClick={close}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {view === 'login' && <LoginForm />}
                {view === 'register' && <RegisterForm />}
                {view === 'forgot-password' && <ForgotPasswordForm />}
            </div>
        </div>
    );
}
