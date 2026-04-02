"use client";

import React, { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Loader2,
    PlayCircle,
    FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Module, Lesson } from "@/types/course";
import { useRouter } from "next/navigation";

interface CourseCurriculumProps {
    modules?: { items: Module[] };
    isLoading: boolean;
    isEnrolled: boolean;
    courseSlug: string;
    onPreviewLesson: (lessonId: string) => void;
    courseDuration?: number;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
    modules,
    isLoading,
    isEnrolled,
    courseSlug,
    onPreviewLesson,
    courseDuration
}) => {
    const router = useRouter();
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-black tracking-tight">Course Content</h2>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {modules?.items?.length || 0} Modules • {courseDuration ? `${Math.floor(courseDuration / 3600)}h ${Math.floor((courseDuration % 3600) / 60)}m` : '0h 0m'}
                </p>
            </div>

            <div className="border border-border/50 rounded-3xl overflow-hidden bg-card/20 shadow-sm transition-all">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center gap-4">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Syllabus...</p>
                    </div>
                ) : modules?.items?.map((module) => {
                    const isExpanded = expandedModules.includes(module.id);
                    return (
                        <div key={module.id} className="border-b border-border/50 last:border-0 group">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-card/80 transition-all text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center transition-colors duration-300">
                                        {isExpanded ? <ChevronUp className="size-4 text-primary" /> : <ChevronDown className="size-4 text-primary" />}
                                    </div>
                                    <h3 className="font-extrabold text-lg">{module.title}</h3>
                                </div>
                                <span className="text-sm font-bold text-muted-foreground">{module.lessonCount || 0} Lessons</span>
                            </button>

                            {isExpanded && module.lessons && (
                                <div className="bg-background/20 px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                    {module.lessons.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 pl-12 hover:bg-card rounded-2xl transition-colors cursor-pointer group">
                                            <div
                                                className="flex items-center gap-4 flex-1"
                                                onClick={() => {
                                                    if (isEnrolled) {
                                                        router.push(`/learn/${courseSlug}/lesson/${lesson.id}`);
                                                    } else if (lesson.isPreview) {
                                                        onPreviewLesson(lesson.id);
                                                    }
                                                }}
                                            >
                                                {lesson.type === 'VIDEO' ? <PlayCircle className="size-4 text-primary" /> : <FileText className="size-4" />}
                                                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{lesson.title}</span>
                                                {lesson.isPreview && !isEnrolled && <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold bg-green-500/10 text-green-600 border-none cursor-pointer hover:bg-green-500/20">Preview</Badge>}
                                            </div>

                                            <span className="text-xs font-bold text-muted-foreground">
                                                {lesson.duration ? (lesson.duration < 60 ? `${lesson.duration}s` : `${Math.floor(lesson.duration / 60)}m`) : "10m"}
                                            </span>
                                        </div>
                                    ))}
                                    {module.lessons.length === 0 && (
                                        <div className="p-4 pl-12 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50 italic">
                                            No lessons yet
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
