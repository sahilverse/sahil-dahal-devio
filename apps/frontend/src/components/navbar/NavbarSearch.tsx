"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import SearchChip from "./SearchChip";
import SearchDropdown from "./SearchDropdown";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function NavbarSearch() {
    const {
        query,
        setQuery,
        results,
        isLoading,
        context,
        suppressContext,
        recentSearches,
        saveRecentSearch,
        removeRecentSearch
    } = useSearch();

    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    const handleSelect = (term: string) => {
        saveRecentSearch(term);
        setIsFocused(false);
    };

    const clearChip = () => {
        if (context) {
            suppressContext(context.type, context.value);
        }
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div ref={containerRef} className="relative flex-1 group">
            <div
                className={cn(
                    "flex items-center gap-2 border rounded-full px-4 py-2 w-full min-w-[500px] max-w-[800px]  transition-all duration-200",
                    isFocused
                        ? "border-brand-primary ring-1 ring-brand-primary bg-white dark:bg-bg-dark"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-transparent"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {!context && (
                    <Image src="/devio-logo.png" width={28} height={28} alt="Search" loading="eager" className="shrink-0" />
                )}

                {context && (
                    <SearchChip
                        type={context.type}
                        label={context.label}
                        iconUrl={context.iconUrl}
                        onClear={clearChip}
                    />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={context ? `Search in ${context.label}` : "Find anything"}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isFocused) setIsFocused(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && query.trim()) {
                            handleSelect(query);
                        }
                        if (e.key === "Escape") {
                            setIsFocused(false);
                            inputRef.current?.blur();
                        }
                    }}
                    className="flex-1 bg-transparent px-1 text-sm focus:outline-none w-full placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                />

                <div className="w-10 flex justify-center items-center">
                    {query && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-1.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isFocused && (
                    <SearchDropdown
                        isOpen={isFocused}
                        query={query}
                        results={results}
                        isLoading={isLoading}
                        recentSearches={recentSearches}
                        onRecentRemove={removeRecentSearch}
                        onSelect={handleSelect}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}