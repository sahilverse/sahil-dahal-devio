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
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-primary p-8 md:p-12 text-white shadow-2xl shadow-brand-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                            <Briefcase className="h-3.5 w-3.5" />
                            Career Opportunities
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                            Your Next <span className="text-brand-primary-foreground/80">Great Chapter</span> Starts Here
                        </h1>
                        <p className="text-brand-primary-foreground/70 text-lg font-medium">
                            Join the best engineering teams. Verified companies only.
                        </p>
                    </div>

                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-brand-primary hover:bg-white/90 font-black rounded-2xl h-14 px-8 shadow-xl shadow-black/10 transition-transform active:scale-95 shrink-0"
                    >
                        <Link href="/jobs/new">
                            <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                            Post a Job
                        </Link>
                    </Button>
                </div>

                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
            </div>

            {/* Toolbar & Search */}
            <div className="sticky top-20 z-30 space-y-4 rounded-3xl border border-border/40 bg-background/60 p-4 backdrop-blur-xl shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary" />
                        <Input
                            placeholder="Search by title, company, or keywords..."
                            className="h-14 bg-muted/30 border-none rounded-2xl pl-12 text-base font-medium placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/40 bg-muted/10 shrink-0">
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all border cursor-pointer",
                                category === cat.id
                                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                                    : "bg-muted/10 hover:bg-muted/20 border-transparent text-muted-foreground"
                            )}
                        >
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
