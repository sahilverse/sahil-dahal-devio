"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import { setTheme, type Theme } from "@/slices/theme";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

interface ThemeToggleProps {
    variant?: "button" | "switch"
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
}

export default function ThemeToggle({ variant = "button", size = "md", showLabel = false }: ThemeToggleProps) {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state: RootState) => state.theme);
    const [hydrated, setHydrated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const setThemeOption = (newTheme: Theme) => {
        dispatch(setTheme(newTheme));
        setIsOpen(false);
    };

    const getIcon = (t: Theme) => {
        switch (t) {
            case "light":
                return <Sun className="w-5 h-5" />;
            case "dark":
                return <Moon className="w-5 h-5" />;
            case "system":
                return <Monitor className="w-5 h-5" />;
            default:
                return <Sun className="w-5 h-5" />;
        };
    };

    const activeIcon = getIcon(theme);

    if (!hydrated) {
        return (
            <Button
                variant="ghost"
                size={size === "sm" ? "sm" : "default"}
                disabled
                className={`${size === "sm" ? "p-2" : "p-3"} opacity-50 cursor-not-allowed`}
            >
                <div className="w-5 h-5 bg-transparent rounded animate-pulse" />
            </Button>
        );
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size={size === "sm" ? "sm" : "default"}
                onClick={() => setIsOpen(!isOpen)}
                className={`${size === "sm" ? "p-2" : "p-3"} transition-colors cursor-pointer`}
                title="Change theme"
            >
                {activeIcon}
                {showLabel && <span className="ml-2 capitalize">{theme}</span>}
            </Button>

            {/* Dialog */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 z-50 min-w-[150px] bg-card border border-border rounded-lg shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="space-y-0.5">
                            <button
                                onClick={() => setThemeOption("light")}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                <Sun className="w-4 h-4" />
                                <span>Light</span>
                            </button>
                            <button
                                onClick={() => setThemeOption("dark")}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                <Moon className="w-4 h-4" />
                                <span>Dark</span>
                            </button>
                            <button
                                onClick={() => setThemeOption("system")}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${theme === 'system' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                <Monitor className="w-4 h-4" />
                                <span>System</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
