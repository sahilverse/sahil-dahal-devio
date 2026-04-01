"use client";

import React from "react";
import Link from "next/link";
import { Star, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types/course";

interface CourseHeroProps {
    course: Course;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ course }) => {
    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 p-8 rounded-3xl border border-border/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center min-h-[320px] lg:w-[calc(100%-380px)]">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Star className="w-64 h-64 rotate-12" />
            </div>

            <div className="flex-1 space-y-5 z-10">
                <div className="flex flex-wrap items-center gap-3">
                    {course.topics && course.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {course.topics.map((topic, idx) => (
                                <Link
                                    key={topic.slug || idx}
                                    href={`/t/${topic.slug}`}
                                    className="group flex items-center gap-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer"
                                >
                                    <span className="text-[10px] font-black text-primary/60 group-hover:text-primary transition-colors">t/</span>
                                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors capitalize">{topic.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
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
                        <span className="font-bold text-slate-100">{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span> ({course.reviewCount} reviews)
                    </div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.enrollmentCount} students</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration ? (course.duration / 3600).toFixed(1) : "0"} total hours</div>
                </div>
            </div>
        </div>
    );
};
