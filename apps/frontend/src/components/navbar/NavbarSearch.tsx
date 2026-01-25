"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function NavbarSearch() {
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        setSearchValue("");
        inputRef.current?.focus();
    };

    return (
        <div
            className={`flex items-center gap-2 border rounded-full px-3 py-1.5 w-full max-w-[600px] mx-4 transition-colors
            ${isFocused ? "border-brand-primary ring-1 ring-brand-primary" : "border-gray-300 dark:border-gray-700"}`}
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

            <div className="w-10 flex justify-center">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleClear}
                    className={`p-1.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${searchValue ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
            </div>
        </div>
    );
}