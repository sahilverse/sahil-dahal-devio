"use client";

import dynamic from "next/dynamic";
import { Loader2, FileText } from "lucide-react";
import { Lesson } from "@/types/course";

const VideoPlayer = dynamic(() => import("@/components/video/VideoPlayer").then(mod => mod.VideoPlayer), {
    ssr: false,
    loading: () => (
        <div className="aspect-video w-full rounded-[2.5rem] bg-background flex flex-col items-center justify-center gap-6 border border-white/10">
            <Loader2 className="size-12 text-brand-primary animate-spin" />
            <p className="font-black tracking-[0.3em] uppercase text-[10px] text-brand-primary/60 italic animate-pulse">Initializing Flux Capacitor...</p>
        </div>
    )
});

interface TheaterVideoAreaProps {
    lesson: Lesson | undefined;
    lessonId: string;
    apiUrl: string | undefined;
    token?: string;
}


export function TheaterVideoArea({
    lesson,
    lessonId,
    apiUrl,
    token
}: TheaterVideoAreaProps) {
    const streamUrl = apiUrl
        ? `${apiUrl.replace(/\/$/, "")}/courses/lessons/${lessonId}/stream/master.m3u8`
        : "";

    return (
        <div className="w-full">
            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_-20px_var(--color-brand-primary)]/15 bg-background border border-white/10 relative group">
                {lesson?.videoUrl ? (
                    lesson.videoStatus === "READY" ? (
                        <VideoPlayer
                            src={streamUrl}
                            title={lesson.title}
                            token={token}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
                                <Loader2 className="size-12 text-brand-primary animate-spin" />
                            </div>
                            <p className="font-black tracking-[0.3em] uppercase text-[10px] text-brand-primary/60 italic animate-pulse">Encoding High-Fidelity Master...</p>
                        </div>
                    )

                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <div className="p-10 rounded-[50px] border border-dashed border-white/20">
                            <FileText className="size-24 stroke-[0.5]" />
                        </div>
                        <p className="font-black tracking-[0.5em] uppercase text-xs">Architectural Narrative</p>
                    </div>
                )}
            </div>
        </div>
    );
}
