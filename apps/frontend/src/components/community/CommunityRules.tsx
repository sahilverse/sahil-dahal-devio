"use client";

import { useCommunityRules } from "@/hooks/useCommunity";
import { CommunityRule } from "@/types/community";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CommunityRulesProps {
    communityName: string;
}

export default function CommunityRules({ communityName }: CommunityRulesProps) {
    const { data: rulesData, isLoading } = useCommunityRules(communityName);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const rules: CommunityRule[] = Array.isArray(rulesData)
        ? rulesData
        : Array.isArray(rulesData?.rules)
            ? rulesData.rules
            : [];

    if (isLoading || rules.length === 0) return null;

    return (
        <div className="border-t border-border/50">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-4 pt-4 pb-2">
                d/{communityName} Rules
            </h3>
            <div className="px-4 pb-4 space-y-1">
                {(rules as CommunityRule[]).map((rule, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div
                            key={idx}
                            className="border border-border/50 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                className="w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {rule.title}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                        isOpen && "rotate-180"
                                    )}
                                />
                            </button>
                            {isOpen && rule.description && (
                                <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                                    <p className="pt-2">{rule.description}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
