"use client";

import { useState } from "react";
import { useFetchProblems } from "@/hooks/useProblems";
import { ProblemListItem, Difficulty } from "@/types/problem";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    CheckCircle2,
    Circle,
    HelpCircle,
    ChevronRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { ProblemSolutionStatus } from "@/types/problem";

export default function ProblemsListPage() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
    const [status, setStatus] = useState<ProblemSolutionStatus | "ALL">("ALL");
    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useFetchProblems({
        search: debouncedSearch,
        difficulty: difficulty === "ALL" ? undefined : [difficulty],
        status: status === "ALL" ? undefined : [status]
    });

    const router = useRouter();
    const problems = data?.pages.flatMap(page => page.items) || [];

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-black tracking-tight">Problems</h1>
                <p className="text-muted-foreground">Pick a challenge and hone your skills. Level up your coding game.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                    <Input
                        placeholder="Search problems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none focus-visible:outline-none placeholder:text-muted-foreground/60 transition-none"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <div className="flex gap-1.5 items-center w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 shrink-0 hidden md:block" />
                        {(["ALL", Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD] as const).map((d) => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border whitespace-nowrap uppercase tracking-wider",
                                    difficulty === d
                                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-border hidden md:block" />

                    <div className="flex gap-1.5 items-center w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        {(["ALL", "SOLVED", "ATTEMPTED", "TODO"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border whitespace-nowrap uppercase tracking-wider",
                                    status === s
                                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Problems List */}
            <div className="bg-card rounded-2xl border border-border relative overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">Difficulty</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Topics</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8 h-16 bg-muted/20" />
                                    </tr>
                                ))
                            ) : problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr
                                        key={problem.id}
                                        onClick={() => router.push(`/p/${problem.slug}`)}
                                        className="transition-colors group cursor-pointer border-b border-border/50 last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            {problem.status === "SOLVED" ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : problem.status === "ATTEMPTED" ? (
                                                <Circle className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-muted-foreground/30" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/p/${problem.slug}`}
                                                className="font-bold text-foreground hover:text-brand-primary transition-colors block"
                                            >
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase",
                                                problem.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
                                                problem.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-500",
                                                problem.difficulty === "HARD" && "bg-rose-500/10 text-rose-600 dark:text-rose-500"
                                            )}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                {problem.topics.slice(0, 3).map(topic => (
                                                    <Link
                                                        key={topic.slug}
                                                        href={`/t/${topic.slug}`}
                                                        className="text-[10px] font-bold text-muted-foreground hover:text-brand-primary bg-muted px-2 py-0.5 rounded-md transition-all hover:bg-muted/80"
                                                    >
                                                        {topic.name}
                                                    </Link>
                                                ))}
                                                {problem.topics.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground font-medium px-1">+{problem.topics.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/p/${problem.slug}`}
                                                className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all group-hover:translate-x-1"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-semibold text-lg">No problems found</p>
                                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Load More */}
                {hasNextPage && (
                    <div className="p-4 border-t border-border bg-muted/10 text-center">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="text-xs font-black text-brand-primary hover:underline flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isFetchingNextPage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load More Problems"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
