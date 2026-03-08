"use client";

import React, { useState } from "react";
import { LabFeed } from "@/components/shared/LabFeed";
import { useFetchLabs } from "@/hooks/useLabs";
import { Input } from "@/components/ui/input";
import { Search, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

const difficulties = [
    { id: "all", label: "All Levels" },
    { id: "EASY", label: "Easy" },
    { id: "MEDIUM", label: "Medium" },
    { id: "HARD", label: "Hard" },
];

export default function LabsDashboardPage() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");
    const debouncedSearch = useDebounce(search, 500);

    const { data: labsResponse, isLoading } = useFetchLabs({
        query: debouncedSearch,
        difficulty: difficulty !== "all" ? difficulty : undefined,
    });

    return (
        <div className="container max-w-5xl py-10 space-y-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/50 border border-slate-800">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/20 text-brand-primary px-4 py-1.5 text-xs font-black uppercase tracking-widest border border-brand-primary/30">
                            <Shield className="h-3.5 w-3.5" />
                            Security Operations Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-slate-100">
                            Hack. Learn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">Dominate.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">
                            Step into isolated, vulnerable environments. Solve real-world challenges, capture flags, and level up your skills.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-3xl border border-slate-800 backdrop-blur-xl">
                        <Zap className="h-10 w-10 text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(2fb,191,36,0.5)]" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Targets</span>
                        <span className="text-3xl font-black mt-1 text-slate-100">{labsResponse?.total || 0}</span>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-primary/20 blur-[100px]" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-purple-500/20 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Toolbar & Search */}
            <div className="sticky top-20 z-30 space-y-4 rounded-3xl border border-border/40 bg-background/60 p-4 backdrop-blur-xl shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary" />
                        <Input
                            placeholder="Search"
                            className="h-14 bg-muted/30 border-none rounded-2xl pl-12 text-base font-medium placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {difficulties.map((diff) => (
                        <button
                            key={diff.id}
                            onClick={() => setDifficulty(diff.id)}
                            className={cn(
                                "whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all border cursor-pointer",
                                difficulty === diff.id
                                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                                    : "bg-muted/10 hover:bg-muted/20 border-transparent text-muted-foreground"
                            )}
                        >
                            {diff.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-foreground/80 flex items-center gap-2">
                        Active Deployments
                    </h2>
                </div>
                <LabFeed
                    rooms={labsResponse?.rooms}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
