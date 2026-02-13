"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug, FileText, History, Loader2, Code2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/problem";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useFetchSubmissions } from "@/hooks/useSubmissions";
import React from "react";
import { useAppSelector } from "@/store/hooks";

interface ProblemDescriptionProps {
    problem: Problem;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function ProblemDescription({ problem, activeTab, setActiveTab }: ProblemDescriptionProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();

    const {
        data: submissionsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isSubmissionsLoading
    } = useFetchSubmissions(problem.slug);

    return (
        <div className="h-full flex flex-col border-r border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-4 border-b border-border bg-card shrink-0">
                    <TabsList className="bg-transparent gap-4 h-11 w-full justify-start overflow-x-auto no-scrollbar">
                        <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                            <FileText className="w-3.5 h-3.5" /> Description
                        </TabsTrigger>
                        <TabsTrigger value="editorial" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                            <Bug className="w-3.5 h-3.5" /> Editorial
                        </TabsTrigger>
                        <TabsTrigger value="submissions" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                            <History className="w-3.5 h-3.5" /> Submissions
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <TabsContent value="description" className="h-full m-0 p-6 focus-visible:outline-none">
                        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>

                        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
                            <span className={cn(
                                "px-2.5 py-1 rounded-full font-bold",
                                problem.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-500",
                                problem.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-500",
                                problem.difficulty === "HARD" && "bg-rose-500/10 text-rose-500"
                            )}>
                                {problem.difficulty}
                            </span>

                            {problem.cipherReward > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full font-bold border border-amber-500/20">
                                    <span className="text-[10px] leading-none">+{problem.cipherReward}</span>
                                    <div className="w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white">₵</div>
                                </div>
                            )}
                            {problem.topics?.map(topic => (
                                <Link
                                    key={topic.id}
                                    href={`/t/${topic.slug}`}
                                    className="bg-muted px-2.5 py-1 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                                >
                                    {topic.name}
                                </Link>
                            ))}
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                            <ReactMarkdown
                                components={{
                                    pre({ children }) {
                                        return (
                                            <pre className="!bg-muted/50 !border-border !my-4 !p-4 rounded-lg overflow-x-auto">
                                                {children}
                                            </pre>
                                        );
                                    },
                                    code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
                                        const isBlock = !!className;
                                        if (isBlock) {
                                            return (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium border border-border/50 break-words my-0" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {problem.description}
                            </ReactMarkdown>
                        </div>
                    </TabsContent>

                    <TabsContent value="editorial" className="p-6">
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground italic">
                            Editorial coming soon.
                        </div>
                    </TabsContent>

                    <TabsContent value="submissions" className="p-0 h-full flex flex-col">
                        {!user ? (
                            <div className="flex flex-col items-center justify-center h-64 p-6 text-center space-y-4">
                                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                                    <History className="w-8 h-8 text-muted-foreground opacity-30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">Sign in to view submissions</h3>
                                    <p className="text-xs text-muted-foreground">Track your progress and review previous attempts.</p>
                                </div>
                                <button
                                    onClick={() => openLogin()}
                                    className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-brand-primary/90 transition-colors"
                                >
                                    Sign In
                                </button>
                            </div>
                        ) : isSubmissionsLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                            </div>
                        ) : submissionsData?.pages[0].items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                                <History className="w-8 h-8 opacity-20" />
                                <p className="text-sm font-medium">No submissions yet.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <div className="divide-y divide-border">
                                    {submissionsData?.pages.map((page, pIdx) => (
                                        <React.Fragment key={pIdx}>
                                            {page.items.map((sub: { id: string; status: string; createdAt: string; language: string; runtime: number | null; memory: number | null }) => (
                                                <div key={sub.id} className="p-4 hover:bg-muted/30 transition-colors group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className={cn(
                                                            "text-xs font-bold uppercase tracking-wider",
                                                            sub.status === "ACCEPTED" ? "text-emerald-500" : "text-rose-500"
                                                        )}>
                                                            {sub.status.replace("_", " ")}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-medium">
                                                            {new Date(sub.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                                            <Code2 className="w-2.5 h-2.5" /> {sub.language}
                                                        </span>
                                                        {sub.runtime !== null && (
                                                            <span>{sub.runtime}ms</span>
                                                        )}
                                                        {sub.memory !== null && (
                                                            <span>{(sub.memory / 1024).toFixed(1)}MB</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {hasNextPage && (
                                    <div className="p-4 flex justify-center border-t border-border">
                                        <button
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
                                        >
                                            {isFetchingNextPage ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                                </>
                                            ) : (
                                                "Load More"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
