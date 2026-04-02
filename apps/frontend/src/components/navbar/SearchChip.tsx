"use client";

import { X, User, Hash, Briefcase, Code, Building, Users, BookOpen } from "lucide-react";
import { SearchResultType } from "@/api/searchService";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";

interface SearchChipProps {
    type: SearchResultType;
    label: string;
    iconUrl?: string | null;
    onClear: () => void;
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

export default function SearchChip({ type, label, iconUrl, onClear }: SearchChipProps) {
    const Icon = typeIcons[type] || User;

    const showActualIcon = iconUrl && [
        SearchResultType.USER,
        SearchResultType.COMMUNITY,
        SearchResultType.COMPANY
    ].includes(type);

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-primary text-white text-xs font-semibold whitespace-nowrap border border-brand-primary/20 animate-in fade-in zoom-in duration-200 shadow-sm"
        )}>
            {showActualIcon ? (
                <UserAvatar
                    user={{ username: label, avatarUrl: iconUrl }}
                    size="xs"
                    className="border-none w-4 h-4"
                />
            ) : (
                <Icon className="w-3.5 h-3.5" />
            )}
            <span>{label}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                }}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
                title="Clear current scope"
            >
                <X className="w-3 h-3 text-white" />
            </button>
        </div>
    );
}
