"use client";

import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useAuthModal } from "../auth/AuthModalContext";

export default function Navbar() {
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { openLogin } = useAuthModal();

    const handleClear = () => {
        setSearchValue("");
        inputRef.current?.focus();
    };

    return (
        <div className="flex justify-between items-center py-2 px-6 border-b border-gray-300 dark:border-gray-700">
            {/* Logo */}
            <div>
                <Link href="/">
                    <p className="text-2xl font-bold">
                        Dev.io
                    </p>
                </Link>
            </div>


            {/* Search Bar */}
            <div
                className={`flex items-center gap-2 border rounded-full px-3 py-1.5 w-full max-w-[400px] mx-4 transition-colors ${isFocused ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-gray-300 dark:border-gray-700'}`}
            >
                <Image src="/devio-logo.png" width={28} height={28} alt="Search" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 bg-transparent px-1 text-sm focus:outline-none w-full placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                />
                {searchValue && (
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer relative right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Login Button & Theme Switch */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle />
                <button
                    onClick={openLogin}
                    className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-pressed transition-colors cursor-pointer text-md"
                >
                    Login
                </button>
            </div>
        </div>
    )
}