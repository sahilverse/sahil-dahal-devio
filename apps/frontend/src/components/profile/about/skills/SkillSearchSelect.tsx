"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchSkills } from "@/hooks/useSkills";
import { useDebounce } from "@/hooks/useDebounce";

interface SkillSearchSelectProps {
    onSkillSelect: (skill: { id: string; name: string }) => void;
    onSkillCreate: (name: string) => void;
}

export function SkillSearchSelect({
    onSkillSelect,
    onSkillCreate,
}: SkillSearchSelectProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const { data: skillResults, isLoading: isSearching } = useSearchSkills(debouncedSearch);

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
        setShowSuggestions(true);
    };

    const handleSelect = (skill: { id: string; name: string }) => {
        setSearchQuery("");
        onSkillSelect(skill);
        setShowSuggestions(false);
    };

    const handleCreate = () => {
        setSearchQuery("");
        onSkillCreate(searchQuery);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <Label htmlFor="skill-search" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 ml-0.5">
                Search or Add Skill
            </Label>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                    id="skill-search"
                    placeholder="Search for a skill (e.g. React, Docker)..."
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 h-11 bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70"
                    autoComplete="off"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && debouncedSearch.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-[250px] overflow-y-auto">
                    {isSearching ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">Searching...</div>
                    ) : (
                        <ul className="py-1">
                            {skillResults && skillResults.map((skill) => (
                                <li
                                    key={skill.id}
                                    className="px-3 py-2 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors"
                                    onClick={() => handleSelect(skill)}
                                >
                                    <span className="text-sm font-medium">{skill.name}</span>
                                </li>
                            ))}
                            {/* Option to create new skill if no direct match or always show as option */}
                            {(!skillResults || !skillResults.some(s => s.name.toLowerCase() === debouncedSearch.toLowerCase())) && (
                                <li
                                    className="px-3 py-3 hover:bg-primary/5 cursor-pointer flex items-center gap-3 border-t border-border/50 group"
                                    onClick={handleCreate}
                                >
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Plus className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-primary">Create "{debouncedSearch}"</span>
                                        <span className="text-[10px] text-muted-foreground">Add this as a new skill</span>
                                    </div>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
