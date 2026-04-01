"use client";

import React, { useState } from "react";
import {
    Star,
    X,
    CheckCircle2,
    Loader2,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfiniteData } from "@tanstack/react-query";
import { CourseReview, Course } from "@/types/course";
import { ReviewItem } from "./ReviewItem";

interface PaginatedReviews {
    items: CourseReview[];
    nextCursor: string | null;
}

interface CourseReviewsProps {
    course: Course;
    user: any;
    reviewsData?: InfiniteData<PaginatedReviews & { averageRating: number; totalReviews: number }>;
    fetchNextPage: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    onSubmitReview: (data: { rating: number; comment: string }) => void;
    onUpdateReview: (data: { reviewId: string; rating: number; comment: string }) => void;
    onDeleteReview: (reviewId: string) => void;
    isSubmitting: boolean;
    isUpdating: boolean;
}

export const CourseReviews: React.FC<CourseReviewsProps> = ({
    course,
    user,
    reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    onSubmitReview,
    onUpdateReview,
    onDeleteReview,
    isSubmitting,
    isUpdating
}) => {
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");

    const handleSubmit = async () => {
        if (!reviewComment.trim()) return;
        onSubmitReview({ rating: userRating, comment: reviewComment });
    };

    // Reset form after submission is no longer pending
    React.useEffect(() => {
        if (!isSubmitting) {
            setUserRating(0);
            setReviewComment("");
        }
    }, [isSubmitting]);

    const hasAlreadyReviewed = reviewsData?.pages?.some(page =>
        page.items.some(r => r.user?.id === user?.id)
    );

    return (
        <section className="space-y-8 pt-6 border-t border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight">Student Discourse</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="size-5 fill-amber-500" />
                            <span className="text-xl font-black">{course.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{course.reviewCount || 0} Total Reviews</span>
                    </div>
                </div>

                {course.isEnrolled && !hasAlreadyReviewed && user && (
                    <Button
                        onClick={() => setUserRating(5)}
                        variant="outline"
                        className="rounded-2xl border-primary/20 hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest gap-2"
                    >
                        <Star className="size-4" />
                        Share Your Experience
                    </Button>
                )}
            </div>

            {/* Rating Form */}
            {userRating > 0 && (
                <div className="bg-primary/[0.03] border border-primary/10 rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Star className="size-32 rotate-12" />
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tight">Architectural Critique</h3>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">Evaluate the instructional fidelity of this module.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setUserRating(0)} className="rounded-xl hover:bg-primary/10 transition-all"><X className="size-5" /></Button>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setUserRating(star)}
                                        className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                    >
                                        <Star
                                            className={`size-12 ${(hoverRating || userRating) >= star
                                                ? 'fill-amber-500 text-amber-500'
                                                : 'text-muted-foreground/20'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Synthesize your insights on this technical journey..."
                                    className="w-full bg-background/50 border border-border/20 rounded-2xl p-6 min-h-[150px] font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:italic outline-none resize-none"
                                />
                                <div className="flex justify-end pt-2">
                                    <Button
                                        disabled={isSubmitting || !reviewComment.trim()}
                                        onClick={handleSubmit}
                                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-primary hover:bg-primary/90 transition-all shadow-[0_15px_30px_-10px_rgba(88,101,242,0.3)] border border-primary/20"
                                    >
                                        {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                                        Transmit Review
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewsData?.pages?.flatMap(page => page.items).map((review) => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        currentUserId={user?.id}
                        onUpdate={onUpdateReview}
                        onDelete={onDeleteReview}
                        isUpdating={isUpdating}
                    />
                ))}
                {reviewsData?.pages?.flatMap(page => page.items).length === 0 && !isFetchingNextPage && (
                    <div className="md:col-span-2 py-24 text-center space-y-6">
                        <div className="size-20 mx-auto rounded-[30px] bg-muted/5 flex items-center justify-center border border-border/5 border-dashed">
                            <Star className="size-8 text-muted-foreground/10" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">The narrative remains unscribed.</p>
                    </div>
                )}
            </div>

            {hasNextPage && (
                <div className="flex justify-center pt-10 pb-20">
                    <Button
                        onClick={fetchNextPage}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        className="h-12 px-8 rounded-2xl border-primary/10 hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest gap-3 transition-all hover:gap-5"
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <>
                                Explore More Feedback
                                <ChevronDown className="size-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </section>
    );
};
