"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Settings, LogOut, Sun, Moon, Monitor, Trophy, X, LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/slices/theme";
import { AuthUser } from "@/slices/auth/authTypes";
import UserAvatar from "./UserAvatar";

interface MobileUserMenuProps {
    user: AuthUser;
    onClose: () => void;
    onLogout: () => void;
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

const MENU_ITEMS: MenuItem[] = [
    { icon: FileText, label: "Drafts", href: "/drafts" },
    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

const THEME_OPTIONS = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
] as const;

export default function MobileUserMenu({ user, onClose, onLogout }: MobileUserMenuProps) {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.theme);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
                onClick={handleClose}
            />
            <div
                className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border z-50 lg:hidden overflow-y-auto transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-4">
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <Link href={`/u/${user.username}`} onClick={handleClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="relative">
                            <UserAvatar user={user} size="lg" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">View Profile</span>
                            <span className="text-sm text-muted-foreground">u/{user.username}</span>
                        </div>
                    </Link>

                    <div className="h-px bg-border my-3" />

                    <div className="space-y-1">
                        {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
                            <Link key={label} href={href} onClick={handleClose} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <Icon className="w-6 h-6 text-muted-foreground" />
                                <span className="font-medium text-foreground">{label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="h-px bg-border my-3" />

                    <div className="flex items-center justify-between px-3 py-3 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Monitor className="w-6 h-6 text-muted-foreground" />
                            <span className="font-medium text-foreground">Display Mode</span>
                        </div>
                        <div className="flex bg-muted rounded-full p-0.5">
                            {THEME_OPTIONS.map(({ value, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => dispatch(setTheme(value))}
                                    className={`p-2 rounded-full transition-colors cursor-pointer ${theme === value ? "bg-background shadow-sm text-brand-primary" : "hover:bg-muted/50 text-muted-foreground"}`}
                                    aria-label={`${value} mode`}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-border my-3" />

                    <button onClick={onLogout} className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-red-600 dark:text-red-400 cursor-pointer">
                        <LogOut className="w-6 h-6" />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
