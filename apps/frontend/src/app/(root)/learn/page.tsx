"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Filter, PlayCircle, Trophy, GraduationCap, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { CourseGrid } from "@/components/learn/CourseGrid";
import { GetCoursesParams } from "@/api/courseService";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";

const COURSE_CATEGORIES = [
    { label: "All Topics", value: undefined },
    { label: "Web Development", value: "web-dev" },
    { label: "Backend & APIs", value: "backend" },
    { label: "DevOps", value: "devops" },
    { label: "System Design", value: "system-design" },
    { label: "Cybersecurity", value: "cybersecurity" },
];


export default function LearnPage() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

    const handleMyLearningClick = () => {
        if (user) {
            router.push("/learn/my-learning");
        } else {
            openLogin();
        }
    };

    return (
        <div className="space-y-6 lg:pr-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BookOpen className="w-32 h-32 -rotate-12" />
                </div>

                <div className="relative z-10 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="size-8 text-primary" />
                        Devio Learn
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Master modern development with highly interactive, project-based video courses.
                    </p>
                </div>

                <div className="relative z-10 flex gap-2">
                    <Button
                        className="font-bold shadow-lg shadow-primary/20"
                        variant="default"
                        onClick={handleMyLearningClick}
                    >
                        <PlayCircle className="mr-2 h-4 w-4" /> My Learning
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">Expert Instructors</p>
                        <p className="text-xs text-muted-foreground">Learn from industry veterans</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Trophy className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Certificates</p>
                        <p className="text-xs text-muted-foreground">Earn verifiable credentials</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-muted/50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Adaptive Learning</p>
                        <p className="text-xs text-muted-foreground">High-quality seamless streaming</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground text-nowrap">
                        <Filter className="w-3 h-3" />
                        CATEGORY
                    </div>
                    {COURSE_CATEGORIES.map((cat) => (
                        <Badge
                            key={cat.value || "all"}
                            variant={selectedCategory === cat.value ? "default" : "outline"}
                            className="cursor-pointer py-1.5 px-4 transition-all hover:border-primary/50 text-nowrap"
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            {cat.label}
                        </Badge>
                    ))}
                </div>

            </div>

            {/* Course Grid with real filters */}
            <div className="pt-4">
                <CourseGrid
                    filters={{
                        topic: selectedCategory,
                        limit: 12
                    }}
                />
            </div>
        </div>
    );
}
