"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/slices/ui/uiSlice";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { Bell, Menu, MessageSquareText, Plus, Search, MoreVertical, Monitor, Sun, Moon, LogIn } from "lucide-react";
import { useAuthModal } from "../../contexts/AuthModalContext";
import NavbarSearch from "./NavbarSearch";
import UserMenu from "./UserMenu";
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
    const dispatch = useAppDispatch();
    const { openLogin } = useAuthModal();

    return (
        <div className="sticky top-0 z-50 bg-white dark:bg-[#0B0B0F] flex justify-between items-center py-2 px-4 border-b border-gray-300 dark:border-gray-700">
            {/* Logo*/}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Link href="/" className="hidden lg:block">
                    <p className="text-2xl font-bold">
                        Dev.io
                    </p>
                </Link>

                <Link href="/" className="lg:hidden">
                    <Image src="/devio-logo.png" width={28} height={28} alt="Dev.io" />
                </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block">
                <NavbarSearch />
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">

                {user ? (
                    <>
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-950"></span>
                        </button>

                        {/* Messages */}
                        <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors cursor-pointer">
                            <MessageSquareText className="w-5 h-5" />
                        </button>

                        {/* Create Button */}
                        <button className="flex items-center gap-1.5 bg-brand-primary text-white px-4 py-1.5 rounded-full hover:bg-brand-pressed transition-colors font-medium text-sm cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span>Create</span>
                        </button>

                        {/* User Avatar Dropdown */}
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

                        {/* Mobile Guest View */}
                        <div className="lg:hidden flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 bg-white dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl">
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <Monitor className="mr-3 h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Display Mode</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="bg-white dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800">
                                            <DropdownMenuItem onClick={() => dispatch(setTheme("light"))} className="cursor-pointer py-2">
                                                <Sun className="mr-2 h-4 w-4" />
                                                <span className="font-medium">Light</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => dispatch(setTheme("dark"))} className="cursor-pointer py-2">
                                                <Moon className="mr-2 h-4 w-4" />
                                                <span className="font-medium">Dark</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => dispatch(setTheme("system"))} className="cursor-pointer py-2">
                                                <Monitor className="mr-2 h-4 w-4" />
                                                <span className="font-medium">System</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />

                                    <DropdownMenuItem onClick={openLogin} className="cursor-pointer py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
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