"use client";

import React from "react";
import { 
    PlayCircle, 
    CheckCircle2, 
    Loader2, 
    Clock, 
    FileText, 
    Trophy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { useRouter } from "next/navigation";

interface CourseActionCardProps {
    course: Course;
    onEnroll: () => void;
    onPreview: () => void;
    isPending: boolean;
}

export const CourseActionCard: React.FC<CourseActionCardProps> = ({
    course,
    onEnroll,
    onPreview,
    isPending
}) => {
    const router = useRouter();

    return (
        <>
            {/* Desktop Sticky Action Card */}
            <div className="w-full md:w-[340px] bg-card text-card-foreground rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-border/50 shrink-0 z-20 hidden md:block lg:absolute lg:right-0 lg:top-0 animate-in slide-in-from-right-4 duration-500">
                <div
                    className="aspect-video relative flex items-center justify-center group cursor-pointer overflow-hidden rounded-t-2xl"
                    onClick={onPreview}
                >
                    {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center opacity-50"><PlayCircle className="size-16" /></div>
                    )}
                    <PlayCircle className="size-16 text-white drop-shadow-2xl z-10 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute bottom-4 text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                        Preview this course
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-baseline gap-2">
                        {!course.isEnrolled && (
                            <h3 className="text-4xl font-black tracking-tighter">
                                {course.price ? `Rs ${course.price}` : "FREE"}
                            </h3>
                        )}
                        {course.isEnrolled && (
                            <div className="flex items-center gap-2 text-green-500 font-black uppercase tracking-widest text-xs py-2">
                                <CheckCircle2 className="size-4" />
                                Enrollment Active
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full py-7 text-lg font-black shadow-[0_10px_20px_rgba(var(--primary),0.2)] rounded-xl cursor-pointer"
                            size="lg"
                            onClick={() => {
                                if (course.isEnrolled) {
                                    router.push(`/learn/${course.slug}/lesson/resume`);
                                } else {
                                    onEnroll();
                                }
                            }}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                            {course.isEnrolled
                                ? (course.progress && course.progress > 0 ? "Continue Learning" : "Start Learning")
                                : "Enroll Now"
                            }
                        </Button>

                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">30-day money-back guarantee</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">This course includes:</h4>
                        <ul className="space-y-2 text-sm font-medium">
                            <li className="flex items-center gap-3"><Clock className="size-4 text-primary" /> {course.duration ? (course.duration / 3600).toFixed(1) : "0"} hours on-demand video</li>
                            <li className="flex items-center gap-3"><FileText className="size-4 text-primary" /> 18 downloadable resources</li>
                            <li className="flex items-center gap-3"><Trophy className="size-4 text-primary" /> Certificate of completion</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                    className="w-full py-6 text-base font-black shadow-xl rounded-xl cursor-pointer"
                    size="lg"
                    onClick={() => {
                        if (course.isEnrolled) {
                            router.push(`/learn/${course.slug}/lesson/start`);
                        } else {
                            onEnroll();
                        }
                    }}
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    {course.isEnrolled ? "Go to Course" : `Enroll Now • Rs ${course.price || 0}`}
                </Button>
            </div>
        </>
    );
};
