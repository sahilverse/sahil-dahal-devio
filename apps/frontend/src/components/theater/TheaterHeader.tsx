"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckCircle2 } from "lucide-react";
import { Lesson } from "@/types/course";

interface TheaterHeaderProps {
    lesson: Lesson | undefined;
    moduleNumber: number;
    isCompleted: boolean;
    onToggleProgress: () => void;
    isUpdatingProgress: boolean;
}

export function TheaterHeader({
    lesson,
    moduleNumber,
    isCompleted,
    onToggleProgress,
    isUpdatingProgress
}: TheaterHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
            <div className="space-y-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] px-3 py-0.5 tracking-widest uppercase rounded-full">
                        Module {moduleNumber}
                    </Badge>
                    <span className="h-px w-8 bg-white/10" />
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest italic">
                        {lesson?.duration ? `${Math.floor(lesson.duration / 60)}m` : "15m"} Runtime
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {lesson?.title || "Technical Overview"}
                </h1>
            </div>

            <Button
                onClick={onToggleProgress}
                disabled={isUpdatingProgress}
                className={`h-16 px-10 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-700 active:scale-95 border border-white/5 group ${isCompleted
                        ? 'bg-green-500 hover:bg-green-500/90 shadow-[0_20px_50px_-10px_rgba(34,197,94,0.3)] border-green-500/20'
                        : 'bg-primary hover:bg-primary/90 shadow-[0_20px_50px_-10px_rgba(88,101,242,0.3)] border-primary/20'
                    }`}
            >
                {isCompleted ? (
                    <>
                        <CheckCircle className="mr-3 size-5 group-hover:scale-110 transition-transform" />
                        Completed
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mr-3 size-5 group-hover:scale-110 transition-transform" />
                        Mark as Completed
                    </>
                )}
            </Button>
        </div>
    );
}
