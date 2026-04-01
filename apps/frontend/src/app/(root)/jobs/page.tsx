"use client";

import React, { useState } from "react";
import { JobFeed } from "@/components/shared/JobFeed";
import { useFetchJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Plus, Filter, SlidersHorizontal, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

const categories = [
    { id: "all", label: "All Roles" },
    { id: "FULL_TIME", label: "Full-time" },
    { id: "REMOTE", label: "Remote" },
    { id: "INTERNSHIP", label: "Internships" },
    { id: "CONTRACT", label: "Contract" },
];

export default function JobBoardPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const debouncedSearch = useDebounce(search, 500);

    const { data: jobsResponse, isLoading } = useFetchJobs({
        query: debouncedSearch,
        type: category !== "all" ? category : undefined,
    });

    return (
        <div className="container max-w-4xl py-10 space-y-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-background/40 p-8 md:p-12 text-foreground shadow-2xl backdrop-blur-3xl">
                {/* Dark Mesh Gradient Background */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/20 via-background to-background" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                            <Briefcase className="h-3.5 w-3.5" />
                            Career Opportunities
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                            Your Next <span className="text-brand-primary">Great Chapter</span> Starts Here
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium">
                            Join the best engineering teams. Verified companies only.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-foreground backdrop-blur-md font-black rounded-2xl h-14 px-6 transition-all active:scale-95"
                        >
                            <Link href="/jobs/applications">
                                My Applications
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border border-brand-primary/20 backdrop-blur-md font-black rounded-2xl h-14 px-8 shadow-[0_0_30px_rgba(88,101,242,0.15)] hover:shadow-[0_0_40px_rgba(88,101,242,0.25)] transition-all active:scale-95 shrink-0 group"
                        >
                            <Link href="/jobs/new">
                                <Plus className="mr-2 h-5 w-5 stroke-[3] group-hover:rotate-90 transition-transform" />
                                Post a Job
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-brand-primary/5 blur-2xl pointer-events-none" />
            </div>

            {/* Toolbar & Search */}
            <div className="sticky top-20 z-30 space-y-4 rounded-3xl border border-white/5 bg-background/60 p-4 backdrop-blur-2xl shadow-xl shadow-black/5">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary" />
                        <Input
                            placeholder="Search by title, company, or topic..."
                            className="h-14 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl pl-13 text-base font-medium placeholder:text-muted-foreground/40 focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-brand-primary/30 focus-visible:border-brand-primary/30 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                    </div>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all border cursor-pointer flex items-center gap-2",
                                category === cat.id
                                    ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30 shadow-[0_0_20px_rgba(88,101,242,0.15)]"
                                    : "bg-white/[0.02] hover:bg-white/[0.05] border-transparent hover:border-white/10 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {category === cat.id && <div className="size-1.5 rounded-full bg-brand-primary animate-pulse" />}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-foreground/80 flex items-center gap-2">
                        Latest Openings
                        {jobsResponse?.total ? (
                            <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-lg text-xs font-black">
                                {jobsResponse.total}
                            </span>
                        ) : null}
                    </h2>
                </div>
                <JobFeed
                    jobs={jobsResponse?.jobs}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
