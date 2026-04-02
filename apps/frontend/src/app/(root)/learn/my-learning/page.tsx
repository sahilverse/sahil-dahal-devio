"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Search,
    ArrowLeft,
    Play,
    Loader2,
    GraduationCap,
    Clock
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function MyLearningPage() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!user) {
            router.replace("/learn");
        }
    }, [user, router]);

    const { data: enrolledData, isLoading, error } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: () => courseService.getMyEnrollments(),
        enabled: !!user,
    });

    if (!user) return null;

    const enrolledCourses = enrolledData?.items;

    return (
        <div className="space-y-8 lg:pr-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/60 p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <GraduationCap className="w-48 h-48 -rotate-12" />
                </div>

                <div className="relative z-10 space-y-3">
                    <Link href="/learn" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">
                        My Learning
                    </h1>
                    <p className="text-muted-foreground max-w-sm font-medium">
                        Track your progress across enrolled courses and continue where you left off.
                    </p>
                </div>

                <div className="relative z-10">
                    <Link href="/learn">
                        <Button className="shadow-lg shadow-primary/20 rounded-xl" variant="brand">
                            <Search className="mr-2 h-4 w-4" /> Explore Catalog
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tight">In Progress</h2>
                    {enrolledCourses && (
                        <Badge variant="secondary" className="font-bold px-3 py-1 rounded-full">{enrolledCourses.length} Courses</Badge>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-20 text-center border-2 border-dashed border-destructive/20 rounded-3xl bg-destructive/5">
                        <p className="text-destructive font-bold">Failed to load enrolled courses.</p>
                        <Button variant="link" className="text-destructive" onClick={() => window.location.reload()}>Try Refreshing</Button>
                    </div>
                ) : enrolledCourses?.length === 0 ? (
                    <div className="w-full text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-card/10 space-y-4">
                        <div className="size-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="size-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-foreground">You haven't enrolled yet.</h3>
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Join thousands of students and start learning.</p>
                        </div>
                        <Link href="/learn" className="inline-block pt-2">
                            <Button size="sm" className="rounded-lg font-bold">Discover Courses</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {enrolledCourses && enrolledCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden border-border/50 group hover:border-primary/50 transition-all hover:shadow-xl rounded-2xl flex flex-col">
                                <Link href={`/l/${course.slug}`} className="block relative group-hover:opacity-90 transition-opacity">
                                    <div className="aspect-[16/7] relative overflow-hidden bg-slate-900">
                                        {course.thumbnailUrl ? (
                                            <img src={course.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary/20"><Play className="size-12" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                            <Badge className="bg-brand-primary/20 backdrop-blur-md text-white border-brand-primary/40 font-bold text-[10px] tracking-widest uppercase">{course.progress || 0}% COMPLETE</Badge>
                                        </div>
                                    </div>
                                </Link>

                                <CardContent className="p-5 flex-1 flex flex-col space-y-4">
                                    <Link href={`/l/${course.slug}`} className="space-y-1 block hover:text-brand-primary transition-colors">
                                        <h3 className="font-extrabold text-lg leading-tight line-clamp-1">{course.title}</h3>
                                    </Link>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                                            <span>Progress</span>
                                            <span className="text-brand-primary">{course.progress || 0}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-primary transition-all duration-700"
                                                style={{ width: `${course.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>


                                    <div className="pt-2">
                                        <Link
                                            href={`/l/${course.slug}/lesson/${(course.progress || 0) > 0 ? 'resume' : 'start'}`}
                                            className="block"
                                        >
                                            <Button className="w-full rounded-xl font-bold text-xs uppercase tracking-widest h-11" size="sm">
                                                <Play className="mr-2 size-3 fill-current" />
                                                {(course.progress || 0) > 0 ? 'Resume Learning' : 'Start Learning'}
                                            </Button>
                                        </Link>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}
