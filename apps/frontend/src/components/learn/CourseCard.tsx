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
    const instructorName = `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || course.instructor.username;

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
                
                <CardContent className="p-4 flex-1 space-y-3">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-2">
                        <img 
                            src={course.instructor.avatarUrl || `https://ui-avatars.com/api/?name=${course.instructor.username}&background=random`} 
                            alt={instructorName} 
                            className="size-6 rounded-full border border-border"
                        />
                        <span className="text-sm text-muted-foreground font-medium">
                            {instructorName}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="size-3.5 fill-amber-500" />
                            <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            <span>{course._count?.enrollments || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>12h+</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="text-xl font-bold text-foreground">
                        {course.price ? `$${course.price}` : <span className="text-primary">FREE</span>}
                    </div>
                    {course.price && (
                        <span className="text-xs text-muted-foreground line-through">$199.99</span>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}
