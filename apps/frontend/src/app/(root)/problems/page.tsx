"use client";

import { useState } from "react";
import { useFetchProblems } from "@/hooks/useProblems";
import { Difficulty } from "@/types/problem";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    CheckCircle2,
    Circle,
    HelpCircle,
    Loader2,
    Coins,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { ProblemSolutionStatus } from "@/types/problem";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "react-tooltip";

export default function ProblemsListPage() {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
    const [status, setStatus] = useState<ProblemSolutionStatus | "ALL">("ALL");
    const [hasBounty, setHasBounty] = useState(false);
    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useFetchProblems({
        search: debouncedSearch,
        difficulty: difficulty === "ALL" ? undefined : [difficulty],
        status: status === "ALL" ? undefined : [status],
        hasBounty: hasBounty || undefined
    });

    const router = useRouter();
    const problems = data?.pages.flatMap(page => page.items) || [];

    return (
        <div className="py-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-black tracking-tight">Problems</h1>
                <p className="text-muted-foreground">Pick a challenge and hone your skills. Level up your coding game.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-3 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1 max-w-sm group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                    <Input
                        placeholder="Search challenges..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-brand-primary placeholder:text-muted-foreground/60 text-xs"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={difficulty} onValueChange={(val) => setDifficulty(val as Difficulty | "ALL")}>
                        <SelectTrigger className="w-[110px] h-9 text-xs font-medium cursor-pointer">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="cursor-pointer text-xs font-medium">Difficulty</SelectItem>
                            <SelectItem value="EASY" className="cursor-pointer text-xs font-medium text-emerald-500">Easy</SelectItem>
                            <SelectItem value="MEDIUM" className="cursor-pointer text-xs font-medium text-amber-500">Medium</SelectItem>
                            <SelectItem value="HARD" className="cursor-pointer text-xs font-medium text-rose-500">Hard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={status} onValueChange={(val) => setStatus(val as ProblemSolutionStatus | "ALL")}>
                        <SelectTrigger className="cursor-pointer w-[110px] h-9 text-xs font-medium">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="cursor-pointer text-xs font-medium">Status</SelectItem>
                            <SelectItem value="UNSOLVED" className="cursor-pointer text-xs font-medium">Todo</SelectItem>
                            <SelectItem value="SOLVED" className="cursor-pointer text-xs font-medium text-emerald-500">Solved</SelectItem>
                            <SelectItem value="ATTEMPTED" className="cursor-pointer text-xs font-medium text-amber-500">Attempted</SelectItem>
                        </SelectContent>
                    </Select>

                    <button
                        onClick={() => setHasBounty(!hasBounty)}
                        className={cn(
                            "flex items-center gap-2 h-9 px-3 rounded-md text-xs font-bold transition-all border shrink-0 cursor-pointer",
                            hasBounty
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Coins className={cn("w-3.5 h-3.5", hasBounty ? "text-amber-500" : "text-muted-foreground")} />
                        <span className="hidden sm:inline">Bounties</span>
                    </button>
                </div>
            </div>

            {/* Problems List */}
            <div className="bg-card rounded-xl border border-border relative overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[20%]">Title</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">Difficulty</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">Rewards</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[40%]">Topics</th>
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
                                        className="even:bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer border-b border-border/40 last:border-0"
                                    >
                                        <td className="px-6 py-3 w-12">
                                            <div
                                                className="w-fit cursor-help"
                                                data-tooltip-id="status-tooltip"
                                                data-tooltip-content={
                                                    problem.status === "SOLVED"
                                                        ? "Solved"
                                                        : problem.status === "ATTEMPTED"
                                                            ? "Attempted"
                                                            : "Unsolved"
                                                }
                                            >
                                                {problem.status === "SOLVED" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : problem.status === "ATTEMPTED" ? (
                                                    <Circle className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-muted-foreground/30" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/p/${problem.slug}`}
                                                    className="font-medium text-sm text-foreground hover:text-brand-primary transition-colors cursor-pointer"
                                                >
                                                    {problem.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 w-32">
                                            <span className={cn(
                                                "text-xs font-medium",
                                                problem.difficulty === "EASY" && "text-emerald-500",
                                                problem.difficulty === "MEDIUM" && "text-amber-500",
                                                problem.difficulty === "HARD" && "text-rose-500"
                                            )}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 w-32">
                                            {problem.cipherReward > 0 ? (
                                                <div className="flex items-center gap-1.5 w-fit px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md text-[11px] font-bold border border-amber-500/20 shadow-sm">
                                                    <Coins className="w-3.5 h-3.5 fill-amber-500/20" />
                                                    {problem.cipherReward}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/30 text-[10px] font-medium ml-2">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {problem.topics.slice(0, 3).map(topic => (
                                                    <Link
                                                        key={topic.slug}
                                                        href={`/t/${topic.slug}`}
                                                        className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md transition-all hover:bg-muted/80 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        t/{topic.name}
                                                    </Link>
                                                ))}
                                                {problem.topics.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">+{problem.topics.length - 3}</span>
                                                )}
                                            </div>
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

            <Tooltip id="status-tooltip" className="z-50 !opacity-100 !text-xs !font-medium" />

        </div>
    );
}
