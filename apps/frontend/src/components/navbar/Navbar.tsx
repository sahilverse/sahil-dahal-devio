"use client";

import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function Navbar() {
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        setSearchValue("");
        inputRef.current?.focus();
    };

    return (
        <div className="flex justify-between items-center py-4">
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
                className={`flex items-center gap-2 border rounded-full px-2 py-2 w-full max-w-2xl mx-4 transition-colors ${isFocused ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-gray-300 dark:border-gray-700'}`}
            >
                <Image src="/devio-logo.png" width={35} height={35} alt="Search" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 bg-transparent px-2 text-md focus:outline-none w-full placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                />
                {searchValue && (
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer relative right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Login Button & Theme Switch */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle />
                <button className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-pressed transition-colors cursor-pointer text-md">Login</button>
            </div>
        </div>
    )
}