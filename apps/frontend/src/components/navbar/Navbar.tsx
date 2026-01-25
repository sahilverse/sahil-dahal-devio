"use client";

import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { Bell, MessageSquareText, Plus } from "lucide-react";
import { useAuthModal } from "../auth/AuthModalContext";
import NavbarSearch from "./NavbarSearch";
import UserMenu from "./UserMenu";


export default function Navbar() {

    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();

    return (
        <div className="sticky top-0 z-50 bg-white dark:bg-[#0B0B0F] flex justify-between items-center py-2 px-6 border-b border-gray-300 dark:border-gray-700">
            {/* Logo*/}
            <div className="flex items-center gap-4">

                <Link href="/">
                    <p className="text-2xl font-bold">
                        Dev.io
                    </p>
                </Link>
            </div>

            {/* Search Bar */}
            <NavbarSearch />

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
                        <ThemeToggle />
                        <button
                            onClick={openLogin}
                            className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-pressed transition-colors cursor-pointer text-md"
                        >
                            Login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}