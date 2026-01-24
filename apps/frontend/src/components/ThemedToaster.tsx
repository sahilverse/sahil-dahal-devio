"use client";

import { Toaster } from "sonner";
import { useAppSelector } from "@/store/hooks";

export default function ThemedToaster() {
    const { actualTheme } = useAppSelector((state) => state.theme);

    return (
        <Toaster
            position="top-right"
            theme={actualTheme as "light" | "dark" | "system"}
            toastOptions={{
                duration: 3000,
                classNames: {
                    toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                }
            }}
        />
    );
}
