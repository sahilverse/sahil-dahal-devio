import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Star, Users, BookOpen } from "lucide-react";
import { Course } from "@/types/course";

interface CourseCardProps {
    course: Course;
}


export function CourseCard({ course }: CourseCardProps) {

    return (
        <Link href={`/learn/${course.slug}`}>
            <Card className="h-full overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col">
                <CardHeader className="p-0 relative aspect-video overflow-hidden">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <BookOpen className="size-12 text-muted-foreground/30" />
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-5 flex-1 space-y-3">
                    {course.topics && course.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-1">
                            {course.topics.slice(0, 3).map((topic, idx) => (
                                <div
                                    key={topic.slug || idx}
                                    className="flex items-center gap-0 px-2 py-0.5 rounded-full bg-muted/30 border border-border/50 text-[10px] font-bold"
                                >
                                    <span className="text-primary/60">t/</span>
                                    <span className="text-muted-foreground">{topic.name}</span>
                                </div>
                            ))}
                            {course.topics.length > 3 && (
                                <span className="text-[10px] font-bold text-muted-foreground/50 self-center">
                                    +{course.topics.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    <h3 className="font-extrabold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold pt-0.5">
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="size-3.5 fill-amber-500" />
                            <span>{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            <span>{course.enrollmentCount} students</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>{course.duration ? (course.duration / 3600).toFixed(1) + "h" : "0h"}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 flex items-center justify-between">
                    <div className="text-2xl font-black text-foreground tracking-tighter">
                        {course.price ? `Rs ${course.price}` : <span className="text-primary">FREE</span>}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
