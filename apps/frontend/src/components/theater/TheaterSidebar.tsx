"use client";

import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    PlaySquare,
    PanelRightClose,
    ChevronUp,
    ChevronDown,
    Loader2,
    CheckCircle,
    PlayCircle
} from "lucide-react";

interface TheaterSidebarProps {
    slug: string;
    currentLessonId: string;
    modules: any[] | undefined;
    progress: {
        percentage: number;
        completedLessonIds: string[];
    } | undefined;
    isOpen: boolean;
    onClose: () => void;
    expandedModules: string[];
    onToggleModule: (id: string) => void;
}

export function TheaterSidebar({
    slug,
    currentLessonId,
    modules,
    progress,
    isOpen,
    onClose,
    expandedModules,
    onToggleModule
}: TheaterSidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 450, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 150 }}
                    className="h-full bg-zinc-950/80 backdrop-blur-3xl border-l border-white/5 flex flex-col relative z-50 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    <div className="p-10 border-b border-white/5 flex items-center justify-between">
                        <div className="flex flex-col gap-3">
                            <h2 className="font-black flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-foreground/90">
                                <div className="size-6 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <PlaySquare className="size-3 text-primary" />
                                </div>
                                Course Content
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress?.percentage || 0}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-brand-primary"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                                    {progress?.percentage || 0}%
                                </span>

                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-12 w-12 hover:bg-white/5 rounded-2xl border border-white/5"
                        >
                            <PanelRightClose className="size-5 text-muted-foreground" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="px-6 py-8 space-y-6">
                            {modules?.map((module, mIdx) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <div key={module.id} className="space-y-4">
                                        <button
                                            onClick={() => onToggleModule(module.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left group cursor-pointer ${isExpanded ? 'bg-white/[0.02] border border-white/5' : 'hover:bg-white/[0.03]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tabular-nums">
                                                    {String(mIdx + 1).padStart(2, '0')}
                                                </span>
                                                <span className="font-black text-[11px] uppercase tracking-widest text-foreground/80 group-hover:text-brand-primary transition-colors">
                                                    {module.title}
                                                </span>

                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="size-3 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="size-3 text-muted-foreground" />
                                            )}
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden pl-4 space-y-2"
                                                >
                                                    {module.lessons.map((l: any) => {
                                                        const isLessonCompleted = progress?.completedLessonIds?.includes(l.id) || false;
                                                        const isCurrent = l.id === currentLessonId;
                                                        return (
                                                            <Link
                                                                key={l.id}
                                                                href={`/learn/${slug}/lesson/${l.id}`}
                                                                className={`flex items-center gap-5 p-4 rounded-2xl cursor-pointer transition-all border border-transparent ${isCurrent ? 'bg-brand-primary/10 border-brand-primary/20 shadow-inner' : 'hover:bg-white/[0.02]'
                                                                    }`}
                                                            >
                                                                <div className="shrink-0">
                                                                    {isCurrent ? (
                                                                        <div className="size-8 rounded-xl flex items-center justify-center gap-0.5 bg-brand-primary/20">
                                                                            {[0, 1, 2].map((i) => (
                                                                                <motion.div
                                                                                    key={i}
                                                                                    animate={{
                                                                                        height: [4, 12, 4],
                                                                                    }}
                                                                                    transition={{
                                                                                        duration: 0.8,
                                                                                        repeat: Infinity,
                                                                                        delay: i * 0.2,
                                                                                        ease: "easeInOut",
                                                                                    }}
                                                                                    className="w-0.5 bg-brand-primary rounded-full"
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    ) : isLessonCompleted ? (
                                                                        <div className="size-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                                                                            <CheckCircle className="size-3.5" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-brand-primary transition-colors">
                                                                            <PlayCircle className="size-3.5" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 space-y-0.5">
                                                                    <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${isCurrent ? 'text-primary' : isLessonCompleted ? 'text-foreground/50' : 'text-muted-foreground/80'
                                                                        }`}>
                                                                        {l.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                                                                            {l.duration ? `${Math.floor(l.duration / 60)}m` : "10m"}
                                                                        </span>
                                                                        {l.type === 'TEXT' && (
                                                                            <Badge variant="secondary" className="text-[7px] px-2 h-4 font-black uppercase tracking-[0.2em] border-none opacity-40 bg-white/5">
                                                                                Abstract
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
