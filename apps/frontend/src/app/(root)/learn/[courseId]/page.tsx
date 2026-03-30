"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    PlayCircle, 
    Clock, 
    Users, 
    Star, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    FileText,
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
// CourseLevel import removed



export default function CourseLandingPage({ params }: { params: { courseId: string } }) {
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", params.courseId],
        queryFn: () => courseService.getCourseBySlug(params.courseId),
    });

    const { data: modules, isLoading: isModulesLoading } = useQuery({
        queryKey: ["course-modules", course?.id],
        queryFn: () => courseService.getCourseModules(course!.id),
        enabled: !!course?.id,
    });

    const toggleModule = (id: string) => {
        setExpandedModules(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse lg:pr-50">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <Skeleton className="h-60 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <AlertCircle className="size-12 text-destructive" />
                <h2 className="text-2xl font-bold">Course Not Found</h2>
                <p className="text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
                <Link href="/learn">
                    <Button variant="outline">Back to Catalog</Button>
                </Link>
            </div>
        );
    }

    const instructorName = `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || course.instructor.username;

    return (
        <div className="space-y-8 lg:pr-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 p-8 rounded-3xl border border-border/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center min-h-[320px]">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Star className="w-64 h-64 rotate-12" />
                </div>

                <div className="flex-1 space-y-5 z-10">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-slate-300 border-slate-700 bg-slate-800/50">Full Access</Badge>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {course.title}
                    </h1>
                    
                    <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-medium pt-2">
                        <div className="flex items-center gap-2 text-amber-400">
                             <Star className="w-4 h-4 fill-amber-400" />
                             <span className="font-bold text-slate-100">4.9</span> (1,234 reviews)
                        </div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course._count?.enrollments || 0} students</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 12.5 total hours</div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <img 
                            src={course.instructor.avatarUrl || `https://ui-avatars.com/api/?name=${course.instructor.username}`} 
                            className="size-8 rounded-full border border-slate-700" 
                            alt={instructorName}
                        />
                        <p className="text-sm">Created by <span className="text-primary font-bold hover:underline cursor-pointer">{instructorName}</span></p>
                    </div>
                </div>

                {/* Sticky Action Card */}
                <div className="w-full md:w-[340px] bg-card text-card-foreground rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-border/50 shrink-0 z-20 hidden md:block lg:absolute lg:right-8 lg:top-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                        {course.thumbnailUrl ? (
                             <img src={course.thumbnailUrl} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        ) : (
                             <div className="size-full bg-slate-800 flex items-center justify-center opacity-50"><PlayCircle className="size-16" /></div>
                        )}
                        <PlayCircle className="size-16 text-white drop-shadow-2xl z-10 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute bottom-4 text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Preview this course</div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black tracking-tighter">
                                {course.price ? `$${course.price}` : "FREE"}
                            </h3>
                            {course.price && <p className="text-muted-foreground text-sm line-through">$199.99</p>}
                        </div>
                        
                        <div className="space-y-3">
                            <Link href={`/learn/${course.slug}/lesson/start`} className="block">
                                <Button className="w-full py-7 text-lg font-black shadow-[0_10px_20px_rgba(var(--primary),0.2)] rounded-xl" size="lg">
                                    Enroll Now
                                </Button>
                            </Link>
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">30-day money-back guarantee</p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">This course includes:</h4>
                            <ul className="space-y-2 text-sm font-medium">
                                <li className="flex items-center gap-3"><Clock className="size-4 text-primary" /> 12.5 hours on-demand video</li>
                                <li className="flex items-center gap-3"><FileText className="size-4 text-primary" /> 18 downloadable resources</li>
                                <li className="flex items-center gap-3"><Trophy className="size-4 text-primary" /> Certificate of completion</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
                <div className="lg:col-span-2 space-y-12">
                    {/* What you'll learn */}
                    <section className="bg-card/30 border border-border/50 rounded-3xl p-8 backdrop-blur-sm">
                        <h2 className="text-2xl font-black tracking-tight mb-6">What you'll learn</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1,2,3,4].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium leading-relaxed">Master the primary core features of the language and ecosystem.</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Syllabus Accordion */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-3xl font-black tracking-tight">Course Content</h2>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {modules?.length || 0} Modules • 2h 45m
                            </p>
                        </div>
                        
                        <div className="border border-border/50 rounded-3xl overflow-hidden bg-card/20 shadow-sm transition-all">
                            {isModulesLoading ? (
                                <div className="p-12 flex flex-col items-center gap-4">
                                     <Loader2 className="size-8 animate-spin text-primary" />
                                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Syllabus...</p>
                                </div>
                            ) : modules?.map((module) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <div key={module.id} className="border-b border-border/50 last:border-0 group">
                                        <button 
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full flex items-center justify-between p-6 hover:bg-card/80 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                </div>
                                                <h3 className="font-extrabold text-lg">{module.title}</h3>
                                            </div>
                                            <span className="text-sm font-bold text-muted-foreground">{module.lessons.length} Lessons</span>
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="bg-background/20 px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                                {module.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-4 pl-12 hover:bg-card rounded-2xl transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            {lesson.type === 'VIDEO' ? <PlayCircle className="size-4 text-primary" /> : <FileText className="size-4" />}
                                                            <span className="text-sm font-semibold">{lesson.title}</span>
                                                            {lesson.isPreview && <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold bg-green-500/10 text-green-600 border-none">Preview</Badge>}
                                                        </div>
                                                        <span className="text-xs font-bold text-muted-foreground">{lesson.duration ? `${Math.floor(lesson.duration/60)}m` : "10m"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Details */}
                <div className="space-y-8">
                     <div className="bg-card/40 border border-border/50 rounded-3xl p-8 space-y-6">
                        <h3 className="text-xl font-black tracking-tight">Your Instructor</h3>
                        <div className="flex items-center gap-4">
                            <img 
                                src={course.instructor.avatarUrl || `https://ui-avatars.com/api/?name=${course.instructor.username}`} 
                                className="size-20 rounded-2xl border-2 border-primary/20 shadow-lg" 
                                alt={instructorName}
                            />
                            <div>
                                <h4 className="font-black text-primary text-lg">{instructorName}</h4>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Expert Educator</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                            Expert in modern full-stack development with a passion for teaching complex technical concepts in an easy-to-understand way.
                        </p>
                        <Button variant="outline" className="w-full font-bold">View Profile</Button>
                     </div>
                </div>
            </div>
        </div>
    );
}

// Minimal placeholder component for types/icons if needed by the system
const Trophy = ({ className }: { className?: string }) => < Star className={className} />;
