"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/slices/ui/uiSlice";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { Bell, Menu, MessageSquareText, Plus, MoreVertical, Monitor, Sun, Moon, LogIn, ArrowLeft } from "lucide-react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import NavbarSearch from "./NavbarSearch";
import MobileSearchButton from "./MobileSearchButton";
import UserMenu from "./UserMenu";
import { useUnreadCount } from "@/hooks/useNotifications";
import Image from "next/image";
import { setTheme } from "@/slices/theme";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const { user } = useAppSelector((state) => state.auth);
    const { theme } = useAppSelector((state) => state.theme);
    const dispatch = useAppDispatch();
    const { openLogin } = useAuthModal();
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const { data: unreadCount } = useUnreadCount();

    // Mobile Search Overlay
    if (showMobileSearch) {
        return (
            <div className="sticky top-0 z-50 bg-white dark:bg-bg-dark border-b border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-3 p-2">
                    <button
                        onClick={() => setShowMobileSearch(false)}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Find anything"
                            autoFocus
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-50 bg-white dark:bg-bg-dark flex justify-between items-center py-2 px-4 border-b border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-1">
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Link href="/" className="hidden lg:block">
                    <p className="text-2xl font-bold">Dev.io</p>
                </Link>

                <Link href="/" className="lg:hidden">
                    <Image src="/devio-logo.png" width={28} height={28} alt="Dev.io" loading="eager" />
                </Link>
            </div>

            <div className="hidden lg:block">
                <NavbarSearch />
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                {/* Mobile Search - Always visible on mobile */}
                <MobileSearchButton onClick={() => setShowMobileSearch(true)} />

                {user ? (
                    <>
                        <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer">
                            <MessageSquareText className="w-5 h-5" />
                        </button>

                        <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            {!!unreadCount && unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full leading-none">
                                    {unreadCount > 10 ? "10+" : unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/create" className="flex items-center gap-1.5 bg-brand-primary text-white px-3 lg:px-4 py-1.5 rounded-full hover:bg-brand-pressed transition-colors font-medium text-sm cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span className="hidden lg:inline">Create</span>
                        </Link>

                        <UserMenu user={user} />
                    </>
                ) : (
                    <>
                        <div className="hidden lg:flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={openLogin}
                                className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-pressed transition-colors cursor-pointer text-md"
                            >
                                Login
                            </button>
                        </div>

                        <div className="lg:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 bg-card">
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer py-2.5 px-3 rounded-lg">
                                            <Monitor className="mr-3 h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Display Mode</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="bg-card">
                                            <DropdownMenuItem
                                                onClick={() => dispatch(setTheme("light"))}
                                                className={`cursor-pointer py-2 ${theme === "light" ? "text-brand-primary bg-muted/50" : ""}`}
                                            >
                                                <Sun className="mr-2 h-4 w-4" />
                                                <span className="font-medium">Light</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => dispatch(setTheme("dark"))}
                                                className={`cursor-pointer py-2 ${theme === "dark" ? "text-brand-primary bg-muted/50" : ""}`}
                                            >
                                                <Moon className="mr-2 h-4 w-4" />
                                                <span className="font-medium">Dark</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => dispatch(setTheme("system"))}
                                                className={`cursor-pointer py-2 ${theme === "system" ? "text-brand-primary bg-muted/50" : ""}`}
                                            >
                                                <Monitor className="mr-2 h-4 w-4" />
                                                <span className="font-medium">System</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onClick={openLogin} className="cursor-pointer py-2.5 px-3 rounded-lg">
                                        <LogIn className="mr-3 h-4 w-4 text-brand-primary" />
                                        <span className="text-sm font-medium text-brand-primary">Log In</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}