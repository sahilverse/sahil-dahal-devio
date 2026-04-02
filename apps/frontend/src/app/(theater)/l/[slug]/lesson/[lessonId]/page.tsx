"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import {
    AlertCircle,
    PanelRightOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { API_URL } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth";

// New Theater Components
import { TheaterLoading, TheaterError } from "@/components/theater/TheaterStates";
import { TheaterHeader } from "@/components/theater/TheaterHeader";
import { TheaterVideoArea } from "@/components/theater/TheaterVideoArea";
import { TheaterTabs } from "@/components/theater/TheaterTabs";
import { TheaterSidebar } from "@/components/theater/TheaterSidebar";

export default function CoursePlayerPage() {
    const params = useParams() as { slug: string; lessonId: string };
    const { slug, lessonId } = params;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // 0. Handle 'start' or 'resume' redirections
    useEffect(() => {
        if (params.lessonId === "start" || params.lessonId === "resume") {
            const resolveId = async () => {
                try {
                    const { lessonId } = await courseService.resolveLesson(slug, params.lessonId);
                    router.replace(`/l/${slug}/lesson/${lessonId}`);
                } catch (err) {
                    console.error("Failed to resolve lesson:", err);
                    toast.error("Failed to find lesson. Starting from beginning.");
                }
            };
            resolveId();
        }
    }, [slug, params.lessonId, router]);

    // 1. Fetch Lesson Data
    const { data: lesson, isLoading: isLessonLoading, error: lessonError } = useQuery({
        queryKey: ["lesson", params.lessonId],
        queryFn: () => courseService.getLessonById(params.lessonId),
        enabled: !!params.lessonId && params.lessonId !== "start" && params.lessonId !== "resume",
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 403 || error?.response?.status === 404) return false;
            return failureCount < 3;
        }
    });

    useEffect(() => {
        if (lessonError) {
            toast.error("You must be enrolled to access this lesson.");
            router.replace(`/l/${slug}`);
        }
    }, [lessonError, slug, router]);

    // 2. Fetch Course & Modules
    const { data: course } = useQuery({
        queryKey: ["course", slug],
        queryFn: () => courseService.getCourseBySlug(slug),
    });

    // Enrollment guard
    useEffect(() => {
        if (course && course.isEnrolled === false) {
            toast.info("Please enroll in the course to access the lesson player.");
            router.replace(`/l/${slug}`);
        }
    }, [course, slug, router]);

    const { data: modules } = useQuery({
        queryKey: ["course-modules", course?.id],
        queryFn: () => courseService.getCourseModules(course!.id),
        enabled: !!course?.id,
    });

    // 3. Fetch Course Progress
    const { data: progress } = useQuery({
        queryKey: ["course-progress", course?.id],
        queryFn: () => courseService.getCourseProgress(course!.id),
        enabled: !!course?.id,
    });

    // 4. Mutation for updating progress
    const updateProgressMutation = useMutation({
        mutationFn: (isCompleted: boolean) => courseService.updateLessonProgress(params.lessonId, isCompleted),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-progress", course?.id] });
            queryClient.invalidateQueries({ queryKey: ["lesson", params.lessonId] });
            toast.success("Progress updated!");
        },
        onError: () => toast.error("Failed to update progress."),
    });

    const isCompleted = progress?.completedLessonIds?.includes(params.lessonId) || false;

    // Sidebar Logic
    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    // Auto-expand current module
    useEffect(() => {
        if (modules?.items && lesson) {
            const currentModule = modules.items.find(m => m.lessons.some(l => l.id === lesson.id));
            if (currentModule && !expandedModules.includes(currentModule.id)) {
                setExpandedModules(prev => [...prev, currentModule.id]);
            }
        }
    }, [modules, lesson]);

    if (isLessonLoading || params.lessonId === "resume" || params.lessonId === "start") {
        return <TheaterLoading />;
    }

    if (lessonError || !lesson) {
        return <TheaterError onAction={() => router.replace(`/l/${slug}`)} />;
    }


    const moduleNumber = (modules?.items?.findIndex(m => m.lessons.some(l => l.id === lesson?.id)) ?? -1) + 1 || 1;

    return (
        <div className="flex flex-row h-full w-full bg-background overflow-hidden selection:bg-primary/30">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative overflow-hidden">
                <ScrollArea className="h-full w-full px-4 md:px-12">
                    <div className="max-w-[1400px] mx-auto pt-8 pb-24 space-y-10">
                        {/* Header Controls */}
                        <div className="flex items-center justify-between">
                            <Link href={`/l/${slug}/lesson/resume`} className="group flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all">
                                    <AlertCircle className="size-4 rotate-180" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{course?.title || "Return to Syllabus"}</span>
                            </Link>

                            {!isSidebarOpen && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest px-4 border border-white/5"
                                >
                                    <PanelRightOpen className="size-4" />
                                    Review Sidebar
                                </Button>
                            )}
                        </div>

                        {/* Video Player Section */}
                        <TheaterVideoArea
                            lesson={lesson}
                            lessonId={params.lessonId}
                            apiUrl={API_URL!}
                            token={getAccessToken() || undefined}
                        />

                        {/* Lesson Header: Title & CTA */}
                        <TheaterHeader
                            lesson={lesson}
                            moduleNumber={moduleNumber}
                            isCompleted={isCompleted}
                            isUpdatingProgress={updateProgressMutation.isPending}
                            onToggleProgress={() => updateProgressMutation.mutate(!isCompleted)}
                        />

                        {/* Tabs Infrastructure */}
                        <TheaterTabs
                            lessonContent={lesson?.content}
                            lessonId={params.lessonId}
                        />
                    </div>
                </ScrollArea>
            </div>

            {/* Sidebar - Syllabus */}
            <TheaterSidebar
                slug={slug}
                currentLessonId={params.lessonId}
                modules={modules?.items}
                progress={progress ? {
                    percentage: progress.percentage,
                    completedLessonIds: progress.completedLessonIds
                } : undefined}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                expandedModules={expandedModules}
                onToggleModule={toggleModule}
            />
        </div>
    );
}

