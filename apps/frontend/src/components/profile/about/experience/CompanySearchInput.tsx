"use client";

import { useState, useRef, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchCompanies } from "@/hooks/useExperience";
import { useDebounce } from "@/hooks/useDebounce";
import { FieldError } from "react-hook-form";

interface CompanySearchInputProps {
    value?: string;
    onCompanySelect: (company: { id: string; name: string }) => void;
    onCompanyChange: (name: string) => void;
    error?: FieldError;
}

export function CompanySearchInput({
    value = "",
    onCompanySelect,
    onCompanyChange,
    error
}: CompanySearchInputProps) {
    const [searchQuery, setSearchQuery] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchQuery(value);
    }, [value]);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const { data: companyResults, isLoading: isSearching } = useSearchCompanies(debouncedSearch);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchQuery(newValue);
        onCompanyChange(newValue);
        setShowSuggestions(true);
    };

    const handleSelect = (company: { id: string; name: string }) => {
        setSearchQuery(company.name);
        onCompanySelect(company);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <Label htmlFor="company" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                Company *
            </Label>
            <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                    id="company"
                    placeholder="Search company..."
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                    autoComplete="off"
                />
            </div>
            {error && (
                <p className="text-[10px] font-medium text-destructive ml-1">{error.message}</p>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && debouncedSearch.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto">
                    {isSearching ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">Searching...</div>
                    ) : companyResults && companyResults.length > 0 ? (
                        <ul className="py-1">
                            {companyResults.map((company) => (
                                <li
                                    key={company.id}
                                    className="px-3 py-2 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors"
                                    onClick={() => handleSelect(company)}
                                >
                                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                        {company.logoUrl ? (
                                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{company.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-xs text-muted-foreground text-center">
                            No companies found. Using "{debouncedSearch}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
