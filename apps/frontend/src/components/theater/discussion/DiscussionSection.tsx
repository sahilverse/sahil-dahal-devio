"use client";

import { useState } from "react";
import { useFetchLessonComments } from "@/hooks/useLessonComments";
import { DiscussionItem } from "./DiscussionItem";
import { DiscussionInput } from "./DiscussionInput";
import {
    MessageSquare,
    Filter,
    ArrowUpDown,
    TrendingUp,
    Clock,
    Loader2,
    PlayCircle,
    ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DiscussionSectionProps {
    lessonId: string;
}

export function DiscussionSection({ lessonId }: DiscussionSectionProps) {
    const [sort, setSort] = useState<"best" | "newest" | "oldest">("best");

    const {
        data: commentsData,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        status,
    } = useFetchLessonComments(lessonId, { sort });

    const comments = (commentsData?.pages as any[])?.flatMap((page) => page.items) || [];


    const sortLabels = {
        best: "Top Rated",
        newest: "Newest First",
        oldest: "Oldest First"
    };


    const sortIcons = {
        best: <TrendingUp className="size-3.5" />,
        newest: <Clock className="size-3.5" />,
        oldest: <ArrowUpDown className="size-3.5" />
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Input Area */}
            <div className="relative group">
                <div className="relative bg-card/10 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-6">

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                <MessageSquare className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-[0.3em] text-foreground/80">Lesson Discussion</h3>
                                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1">Share insights with fellow students</p>
                            </div>

                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-10 gap-2 rounded-2xl border border-white/5 hover:bg-white/5 px-4 cursor-pointer">
                                    {sortIcons[sort]}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{sortLabels[sort]}</span>
                                    <Filter className="size-3 text-muted-foreground/30 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-popover/80 backdrop-blur-2xl border-white/10 p-2 rounded-3xl shadow-3xl">
                                <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Sort By</DropdownMenuLabel>

                                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as any)}>
                                    <DropdownMenuRadioItem value="best" className="gap-3 py-4 rounded-2xl cursor-pointer focus:bg-white/5">
                                        <TrendingUp className="size-4 text-orange-500" />
                                        <span className="font-bold text-xs">Top Rated</span>
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest" className="gap-3 py-4 rounded-2xl cursor-pointer focus:bg-white/5">
                                        <Clock className="size-4 text-primary" />
                                        <span className="font-bold text-xs">Newest First</span>
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="oldest" className="gap-3 py-4 rounded-2xl cursor-pointer focus:bg-white/5">
                                        <ArrowUpDown className="size-4 text-muted-foreground" />
                                        <span className="font-bold text-xs">Oldest First</span>
                                    </DropdownMenuRadioItem>

                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <DiscussionInput lessonId={lessonId} />
                </div>
            </div>

            {/* List Area */}
            <div className="space-y-8 min-h-[400px]">
                {isPending ? (

                    <div className="py-24 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="size-10 text-primary animate-spin opacity-20" />
                        <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] animate-pulse">Loading Discussion...</p>
                    </div>

                ) : comments.length === 0 ? (
                    <div className="py-32 text-center space-y-8 group">
                        <div className="relative inline-block">
                            <div className="size-24 mx-auto rounded-[36px] bg-white/[0.02] flex items-center justify-center border border-white/5 border-dashed group-hover:scale-110 transition-transform duration-700">
                                <PlayCircle className="size-10 text-muted-foreground/10 group-hover:text-primary/20 transition-colors" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-8 rounded-2xl bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/40 animate-bounce">
                                <TrendingUp className="size-4 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black text-foreground/40 uppercase tracking-[0.3em]">No comments yet</p>
                            <p className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">Be the first to share your thoughts on this lesson.</p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest h-11 px-8 hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                            Post Comment
                        </Button>

                    </div>
                ) : (
                    <>
                        <div className="space-y-8">
                            {comments.map((comment) => (
                                <DiscussionItem
                                    key={comment.id}
                                    comment={comment}
                                    lessonId={lessonId}
                                />
                            ))}
                        </div>

                        {hasNextPage && (
                            <div className="pt-12 pb-24 text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="h-16 w-full max-w-sm rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] gap-4 group cursor-pointer"
                                >
                                    {isFetchingNextPage ? (
                                        <Loader2 className="size-6 animate-spin text-primary" />
                                    ) : (
                                        <>
                                            <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors">Load More Comments</span>
                                            <ChevronDown className="size-5 text-muted-foreground/40 group-hover:translate-y-1 transition-transform" />
                                        </>

                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
