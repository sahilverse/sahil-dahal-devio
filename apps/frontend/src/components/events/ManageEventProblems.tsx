"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EventService } from "@/api/eventService";
import { useFetchProblems } from "@/hooks/useProblems";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Plus,
    X,
    Loader2,
    Trophy,
    MoveVertical,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";

interface ManageEventProblemsProps {
    eventId: string;
    currentProblems: any[];
    onRefresh: () => void;
}

export default function ManageEventProblems({ eventId, currentProblems, onRefresh }: ManageEventProblemsProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [points, setPoints] = useState<Record<string, number>>({});
    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [problemToRemove, setProblemToRemove] = useState<string | null>(null);

    const { data: searchResults, isLoading: isSearching } = useFetchProblems({
        search: debouncedSearch,
    });

    const addProblemMutation = useMutation({
        mutationFn: (data: { problemId: string; points: number; order: number }) =>
            EventService.addEventProblem(eventId, data),
        onSuccess: () => {
            toast.success("Problem added to event");
            onRefresh();
            setIsAdding(null);
        },
        onError: (error: any) => {
            toast.error(error.errorMessage || "Failed to add problem");
            setIsAdding(null);
        },
    });

    const removeProblemMutation = useMutation({
        mutationFn: (problemId: string) =>
            EventService.removeEventProblem(eventId, problemId),
        onSuccess: () => {
            toast.success("Problem removed from event");
            onRefresh();
        },
        onError: (error: any) => {
            toast.error(error.errorMessage || "Failed to remove problem");
        },
    });

    const handleAddProblem = (problemId: string) => {
        setIsAdding(problemId);
        const problemPoints = points[problemId] || 100; // Default 100 points
        const order = currentProblems.length + 1;
        addProblemMutation.mutate({ problemId, points: problemPoints, order });
    };

    const handleRemoveProblem = (problemId: string) => {
        setProblemToRemove(problemId);
    };

    const confirmRemove = () => {
        if (problemToRemove) {
            removeProblemMutation.mutate(problemToRemove);
            setProblemToRemove(null);
        }
    };

    const availableProblems = searchResults?.pages.flatMap(page => page.items) || [];
    const currentProblemIds = new Set(currentProblems.map(p => p.problemId));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* compact Header Banner */}
            <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent rounded-2xl border border-brand-primary/20" />
                <div className="relative p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Trophy className="w-6 h-6 text-brand-primary drop-shadow-sm" />
                    </div>
                    <div>
                        <h3 className="text-base font-black tracking-tight text-foreground uppercase">Configure Contest</h3>
                        <p className="text-[11px] text-muted-foreground font-bold tracking-tight uppercase opacity-70">
                            Search database and add challenges with custom scoring.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Search Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                            <Search className="w-3 h-3" /> Find Challenges
                        </h4>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-brand-primary transition-all pointer-events-none" />
                        <Input
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 border-border/40 focus:border-brand-primary/50 bg-muted/20 focus:bg-background transition-all rounded-xl shadow-none text-xs font-bold"
                        />
                    </div>

                    <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/20 max-h-[380px] overflow-y-auto scrollbar-none shadow-sm">
                        {isSearching ? (
                            <div className="p-8 text-center bg-muted/5">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-primary/40 mb-2" />
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">Querying database...</p>
                            </div>
                        ) : availableProblems.length > 0 ? (
                            availableProblems.map((problem) => {
                                const isAdded = currentProblemIds.has(problem.id);
                                return (
                                    <div
                                        key={problem.id}
                                        className={cn(
                                            "py-2 px-3.5 flex items-center justify-between transition-all group border-b border-border/10 last:border-0",
                                            isAdded && "opacity-60 bg-muted/10"
                                        )}
                                    >
                                        <div className="space-y-1 flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h5 className="text-xs font-black text-foreground group-hover:text-brand-primary transition-colors uppercase truncate tracking-tight">{problem.title}</h5>
                                                {isAdded && (
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                                        <CheckCircle2 className="w-2.5 h-2.5" /> Added
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/60 uppercase">
                                                <Badge variant="outline" className="h-3.5 py-0 px-1 font-black tracking-tighter text-[8px] border-border/30 rounded-md bg-muted/30">{problem.difficulty}</Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {!isAdded ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="relative group/input">
                                                        <Input
                                                            type="number"
                                                            placeholder="100"
                                                            className="w-14 h-7 text-[10px] font-black rounded-lg text-center bg-muted/50 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-brand-primary/30 pr-4 pl-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={points[problem.id] || ""}
                                                            onChange={(e) => setPoints({ ...points, [problem.id]: parseInt(e.target.value) })}
                                                        />
                                                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-muted-foreground/40 pointer-events-none group-focus-within/input:text-brand-primary/50 transition-colors uppercase">Pts</span>
                                                    </div>
                                                    <div
                                                        onClick={() => handleAddProblem(problem.id)}
                                                        className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm border border-brand-primary/10 cursor-pointer"
                                                    >
                                                        {isAdding === problem.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/10">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : search.length > 0 ? (
                            <div className="p-8 text-center bg-muted/5">
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">No results found</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-muted/5">
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Type to see challenges</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selection Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                            <MoveVertical className="w-3 h-3" /> Current Selection ({currentProblems.length})
                        </h4>
                    </div>

                    <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/20 shadow-sm min-h-[100px]">
                        {currentProblems.length > 0 ? (
                            [...currentProblems].sort((a, b) => (a.order || 0) - (b.order || 0)).map((ep, index) => (
                                <div key={ep.id || ep.problemId} className="py-2.5 px-3.5 flex items-center justify-between group hover:bg-muted/10 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-muted/50 border border-border/20 flex items-center justify-center text-[9px] font-black text-muted-foreground group-hover:bg-brand-primary/10 group-hover:text-brand-primary group-hover:border-brand-primary/10 transition-all">
                                            {ep.order || index + 1}
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <h5 className="text-xs font-black text-foreground uppercase truncate tracking-tight">{ep.problem?.title}</h5>
                                            <div className="flex items-center gap-2 text-[9px] font-extrabold text-brand-primary uppercase tracking-tighter">
                                                <Trophy className="w-2.5 h-2.5 opacity-70" /> {ep.points} Points
                                                <span className="text-muted-foreground/30">•</span>
                                                <span className="text-muted-foreground/60">{ep.problem?.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveProblem(ep.problemId)}
                                        className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/50">
                                    <Plus className="w-4 h-4 text-muted-foreground/40" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Your contest is empty</p>
                                    <p className="text-[9px] text-muted-foreground/40 font-bold uppercase">Add some challenges to get started</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!problemToRemove}
                onClose={() => setProblemToRemove(null)}
                onConfirm={confirmRemove}
                title="Remove Problem"
                description="Are you sure you want to remove this problem from the contest? This action cannot be undone."
                variant="destructive"
                confirmText="Remove"
                isPending={removeProblemMutation.isPending}
            />
        </div>
    );
}
