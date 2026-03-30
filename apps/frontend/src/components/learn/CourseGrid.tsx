"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { courseService, GetCoursesParams } from "@/api/courseService";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseGridProps {
    filters: GetCoursesParams;
}

export function CourseGrid({ filters }: CourseGridProps) {
    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey: ["courses", filters],
        queryFn: () => courseService.getCourses(filters),
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <p className="text-destructive font-medium">Failed to load courses</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try Again
                </Button>
            </div>
        );
    }

    const courses = response?.items || [];

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-card/40 rounded-3xl border border-dashed border-border/50 animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-muted/50 rounded-full">
                    <SearchX className="size-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">No courses found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        We couldn't find any courses matching your current filters. Try adjusting them!
                    </p>
                </div>
                <Button variant="link" onClick={() => window.location.reload()}>
                    Clear all filters
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}
