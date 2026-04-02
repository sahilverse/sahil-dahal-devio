"use client";

import { motion } from "motion/react";
import { Clock, X, User, Hash, Briefcase, Code, Building, Users, Search, ArrowRight, BookOpen } from "lucide-react";
import { SearchResult, SearchResultType, GlobalSearchResponse } from "@/api/searchService";
import { cn, formatCompactNumber } from "@/lib/utils";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

interface SearchDropdownProps {
    isOpen: boolean;
    query: string;
    results: GlobalSearchResponse | null;
    isLoading: boolean;
    recentSearches: string[];
    onRecentRemove: (term: string) => void;
    onSelect: (term: string) => void;
    isMobile?: boolean;
}

const typeIcons = {
    [SearchResultType.USER]: User,
    [SearchResultType.TOPIC]: Hash,
    [SearchResultType.JOB]: Briefcase,
    [SearchResultType.PROBLEM]: Code,
    [SearchResultType.COMPANY]: Building,
    [SearchResultType.COMMUNITY]: Users,
    [SearchResultType.COURSE]: BookOpen,
};

const typeLabels = {
    [SearchResultType.USER]: "Profiles",
    [SearchResultType.TOPIC]: "Topics",
    [SearchResultType.JOB]: "Jobs",
    [SearchResultType.PROBLEM]: "Problems",
    [SearchResultType.COMPANY]: "Companies",
    [SearchResultType.COMMUNITY]: "Communities",
    [SearchResultType.COURSE]: "Courses",
};

export default function SearchDropdown({
    isOpen,
    query,
    results,
    isLoading,
    recentSearches,
    onRecentRemove,
    onSelect,
    isMobile = false
}: SearchDropdownProps) {
    if (!isOpen) return null;

    const hasResults = results && Object.values(results).some(arr => arr.length > 0);

    return (
        <motion.div
            initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "z-50 bg-white dark:bg-bg-dark overflow-hidden flex flex-col transition-all duration-200",
                isMobile
                    ? "w-full min-h-0 flex-1 border-none shadow-none"
                    : "absolute top-full left-4 right-4 mt-2 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-h-[80vh] backdrop-blur-md"
            )}
        >
            <div className="overflow-y-auto custom-scrollbar flex-1">
                {/* Search Suggestion (Top Row) */}
                {query.trim() && (
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                        <div
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => onSelect(query)}
                        >
                            <Search className="w-4 h-4 text-gray-400 font-bold" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Search for "{query}"</span>
                        </div>
                    </div>
                )}

                {/* Recent Searches */}
                {!query.trim() && recentSearches.length > 0 && (
                    <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Recent Searches
                        </div>
                        <div className="space-y-1">
                            {recentSearches.map((term) => (
                                <div
                                    key={term}
                                    className="flex items-center justify-between group px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => onSelect(term)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRecentRemove(term);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all text-gray-400 hover:text-red-500 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Initial Focus Helper */}
                {!query.trim() && recentSearches.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Search for users, topics, jobs, or communities</p>
                        <p className="text-xs text-gray-400 mt-1">Try u/sahil or t/react or l/nextjs</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                                    <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results List */}
                {query.trim() && !isLoading && results && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {Object.entries(results).map(([type, items]) => {
                            if (items.length === 0) return null;
                            const resType = type.replace(/s$/, "") as SearchResultType; // handle s suffix
                            const Icon = typeIcons[resType] || User;

                            return (
                                <div key={type} className="p-2">
                                    <h3 className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        {typeLabels[resType] || type}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {items.map((item: SearchResult) => {
                                            const showActualIcon = item.iconUrl && [
                                                SearchResultType.USER,
                                                SearchResultType.COMMUNITY,
                                                SearchResultType.COMPANY
                                            ].includes(item.type);

                                            return (
                                                <Link
                                                    key={`${item.type}-${item.id}`}
                                                    href={getLink(item)}
                                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded-lg group transition-all"
                                                    onClick={() => onSelect(query)}
                                                >
                                                    {showActualIcon ? (
                                                        <UserAvatar
                                                            user={{ username: item.name, avatarUrl: item.iconUrl }}
                                                            size="sm"
                                                            className="border-none"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                            <Icon className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                                                            {item.name}
                                                            {item.type === SearchResultType.PROBLEM && item.metadata?.difficulty && (
                                                                <span className={cn(
                                                                    "text-[10px] px-1 rounded uppercase",
                                                                    item.metadata.difficulty === 'EASY' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                        item.metadata.difficulty === 'MEDIUM' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {item.metadata.difficulty}
                                                                </span>
                                                            )}
                                                        </p>
                                                        {/* Metadata Subtitles */}
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {item.type === SearchResultType.USER && `u/${item.slug} • ${formatNumber(item.metadata?.aura || 0)} Aura`}
                                                            {item.type === SearchResultType.COMMUNITY && `d/${item.slug} • ${formatNumber(item.metadata?.visitors || 0)} weekly visitors`}
                                                            {item.type === SearchResultType.TOPIC && `t/${item.slug} • ${formatNumber(item.metadata?.count || 0)} items`}
                                                            {item.type === SearchResultType.COMPANY && `c/${item.slug}`}
                                                            {item.type === SearchResultType.COURSE && `l/${item.slug} • ${item.metadata?.author || 'Devio'}`}
                                                            {item.type === SearchResultType.JOB && item.metadata?.companyName}
                                                            {item.type === SearchResultType.PROBLEM && "Problem Solving"}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* No Results matched what was typed */}
                {query.trim() && !isLoading && !hasResults && (
                    <div className="p-8 text-center">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">No results found for "{query}"</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function formatNumber(num: number): string {
    return formatCompactNumber(num);
}

function getLink(item: SearchResult): string {
    switch (item.type) {
        case SearchResultType.USER: return `/u/${item.slug}`;
        case SearchResultType.TOPIC: return `/t/${item.slug}`;
        case SearchResultType.JOB: return `/j/${item.slug}`;
        case SearchResultType.PROBLEM: return `/p/${item.slug}`;
        case SearchResultType.COMPANY: return `/c/${item.slug}`;
        case SearchResultType.COMMUNITY: return `/d/${item.slug}`;
        case SearchResultType.COURSE: return `/l/${item.slug}`;
        default: return "/";
    }
}
