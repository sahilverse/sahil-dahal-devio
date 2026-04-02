"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useParams } from "next/navigation";
import { searchService, SearchResult, GlobalSearchResponse, SearchResultType } from "@/api/searchService";
import { UserService } from "@/api/userService";
import { CommunityService } from "@/api/communityService";
import { CompanyService } from "@/api/companyService";
import debounce from "lodash/debounce";

const RECENT_SEARCHES_KEY = "devio_recent_searches";

export interface SearchContext {
    type: SearchResultType;
    value: string;
    label: string;
    iconUrl?: string | null;
}

export function useSearch() {
    const pathname = usePathname();
    const params = useParams();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GlobalSearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [contextMetadata, setContextMetadata] = useState<Record<string, string | null>>({});
    const [suppressedContexts, setSuppressedContexts] = useState<Set<string>>(new Set());

    // Detect Context
    const rawContext = useMemo((): SearchContext | null => {
        if (!pathname) return null;

        const parts = pathname.split("/").filter(Boolean);
        if (parts.length < 2) return null;

        const typePart = parts[0];
        const valuePart = params.slug || params.username || parts[1];

        if (typeof valuePart !== "string") return null;

        const contextKey = `${typePart}:${valuePart}`;
        if (suppressedContexts.has(contextKey)) return null;

        switch (typePart) {
            case "u": return { type: SearchResultType.USER, value: valuePart, label: `u/${valuePart}` };
            case "t": return { type: SearchResultType.TOPIC, value: valuePart, label: `t/${valuePart}` };
            case "j": return { type: SearchResultType.JOB, value: valuePart, label: `j/${valuePart}` };
            case "p": return { type: SearchResultType.PROBLEM, value: valuePart, label: `p/${valuePart}` };
            case "c": return { type: SearchResultType.COMPANY, value: valuePart, label: `c/${valuePart}` };
            case "d": return { type: SearchResultType.COMMUNITY, value: valuePart, label: `d/${valuePart}` };
            case "l": return { type: SearchResultType.COURSE, value: valuePart, label: `l/${valuePart}` };
            default: return null;
        }
    }, [pathname, params, suppressedContexts]);

    // Fetch Metadata for Context Chip (Users, Communities, Companies ONLY)
    useEffect(() => {
        if (!rawContext) return;

        // Restriction: Only fetch actual images for User, Community, and Company
        const needsActualImage = [
            SearchResultType.USER, 
            SearchResultType.COMMUNITY, 
            SearchResultType.COMPANY
        ].includes(rawContext.type);

        if (!needsActualImage) return;

        const contextKey = `${rawContext.type}:${rawContext.value}`;
        if (contextMetadata[contextKey] !== undefined) return;

        const fetchMeta = async () => {
            try {
                let iconUrl: string | null = null;
                if (rawContext.type === SearchResultType.USER) {
                    const profile = await UserService.getProfile(rawContext.value);
                    iconUrl = profile?.avatarUrl || null;
                } else if (rawContext.type === SearchResultType.COMMUNITY) {
                    const community = await CommunityService.getCommunity(rawContext.value);
                    iconUrl = community?.iconUrl || null;
                } else if (rawContext.type === SearchResultType.COMPANY) {
                    const company = await CompanyService.getBySlug(rawContext.value);
                    iconUrl = company?.logoUrl || null;
                }
                setContextMetadata(prev => ({ ...prev, [contextKey]: iconUrl }));
            } catch (e) {
                setContextMetadata(prev => ({ ...prev, [contextKey]: null }));
            }
        };

        fetchMeta();
    }, [rawContext, contextMetadata]);

    const context = useMemo(() => {
        if (!rawContext) return null;
        const contextKey = `${rawContext.type}:${rawContext.value}`;
        return {
            ...rawContext,
            iconUrl: contextMetadata[contextKey] || null
        };
    }, [rawContext, contextMetadata]);

    // Load recent searches
    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch (e) {
                setRecentSearches([]);
            }
        }
    }, []);

    const suppressContext = (type: SearchResultType, value: string) => {
        const key = `${type === SearchResultType.USER ? 'u' : 
                     type === SearchResultType.TOPIC ? 't' :
                     type === SearchResultType.JOB ? 'j' :
                     type === SearchResultType.PROBLEM ? 'p' :
                     type === SearchResultType.COMPANY ? 'c' :
                     type === SearchResultType.COURSE ? 'l' : 'd'}:${value}`;
        setSuppressedContexts(prev => new Set(prev).add(key));
    };

    const saveRecentSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        setRecentSearches(prev => {
            const next = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 5);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
            return next;
        });
    };

    const removeRecentSearch = (searchTerm: string) => {
        setRecentSearches(prev => {
            const next = prev.filter(s => s !== searchTerm);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
            return next;
        });
    };

    const performSearch = useCallback(
        debounce(async (q: string, ctx: SearchContext | null) => {
            if (!q.trim()) {
                setResults(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                let finalQuery = q;
                if (ctx) {
                    const prefix = ctx.type === SearchResultType.USER ? "u/" :
                                 ctx.type === SearchResultType.TOPIC ? "t/" :
                                 ctx.type === SearchResultType.JOB ? "j/" :
                                 ctx.type === SearchResultType.PROBLEM ? "p/" :
                                 ctx.type === SearchResultType.COMPANY ? "c/" :
                                 ctx.type === SearchResultType.COURSE ? "l/" :
                                 ctx.type === SearchResultType.COMMUNITY ? "d/" : "";
                    
                    if (!q.includes("/")) {
                        finalQuery = `${prefix}${q}`;
                    }
                }

                const data = await searchService.globalSearch(finalQuery);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        performSearch(query, context);
    }, [query, context, performSearch]);

    return {
        query,
        setQuery,
        results,
        isLoading,
        context,
        suppressContext,
        recentSearches,
        saveRecentSearch,
        removeRecentSearch
    };
}
