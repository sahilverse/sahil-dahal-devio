"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import { PromoService } from "@/api/promoService";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutModal, { type CheckoutItem } from "@/components/shared/CheckoutModal";
import { useInitiateCoursePurchase } from "@/hooks/usePayment";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppSelector } from "@/store/hooks";
import { PaymentSession } from "@/lib/payment-session";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { API_URL } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth";
import { toast } from "sonner";

import { CourseHero } from "@/components/learn/detail/CourseHero";
import { CourseActionCard } from "@/components/learn/detail/CourseActionCard";
import { CourseCurriculum } from "@/components/learn/detail/CourseCurriculum";
import { CourseReviews } from "@/components/learn/detail/CourseReviews";

const VideoPlayer = dynamic(() => import("@/components/video/VideoPlayer").then(mod => mod.VideoPlayer), {
    ssr: false,
    loading: () => <div className="aspect-video w-full rounded-2xl bg-black flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
});

export default function CourseLandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
    const { user } = useAppSelector((state) => state.auth);

    const { openLogin } = useAuthModal();
    const queryClient = useQueryClient();
    const initiateCoursePurchase = useInitiateCoursePurchase();

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", slug, user?.id],
        queryFn: () => courseService.getCourseBySlug(slug),
        enabled: !!slug,
    });

    const { data: modules, isLoading: isModulesLoading } = useQuery({
        queryKey: ["course-modules", course?.id],
        queryFn: () => courseService.getCourseModules(course!.id),
        enabled: !!course?.id,
    });

    const {
        data: reviewsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["course-reviews", course?.id],
        queryFn: ({ pageParam }) => courseService.getCourseReviews(course!.id, { limit: 10, cursor: pageParam }),
        enabled: !!course?.id,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    });

    const submitReviewMutation = useMutation({
        mutationFn: (data: { rating: number; comment: string }) => courseService.postCourseReview(course!.id, data),
        onSuccess: () => {
            toast.success("Review submitted!");
            queryClient.invalidateQueries({ queryKey: ["course", slug] });
            queryClient.invalidateQueries({ queryKey: ["course-reviews", course?.id] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to submit review.");
        },
    });

    const updateReviewMutation = useMutation({
        mutationFn: (data: { reviewId: string; rating: number; comment: string }) =>
            courseService.updateCourseReview(course!.id, data.reviewId, { rating: data.rating, comment: data.comment }),
        onSuccess: () => {
            toast.success("Review updated!");
            queryClient.invalidateQueries({ queryKey: ["course", slug] });
            queryClient.invalidateQueries({ queryKey: ["course-reviews", course?.id] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to update review.");
        },
    });

    const deleteReviewMutation = useMutation({
        mutationFn: (reviewId: string) => courseService.deleteCourseReview(course!.id, reviewId),
        onSuccess: () => {
            toast.success("Review deleted!");
            queryClient.invalidateQueries({ queryKey: ["course", slug] });
            queryClient.invalidateQueries({ queryKey: ["course-reviews", course?.id] });
        },
        onError: (err: any) => {
            toast.error(err?.errorMessage || "Failed to delete review.");
        },
    });

    const handlePreviewClick = () => {
        if (isModulesLoading) {
            toast.info("Synthesizing course data... Please wait.");
            return;
        }

        const allLessons = modules?.items?.flatMap(m => m.lessons) || [];
        const firstPreview = allLessons.find(l => l.isPreview) || allLessons[0];

        if (firstPreview) {
            setPreviewLessonId(firstPreview.id);
        } else {
            toast.info("No preview lessons found in this module yet.");
        }
    };

    const handleEnrollClick = () => {
        if (!user) {
            openLogin();
            return;
        }

        if (!course) return;

        if (course.price === 0 || !course.price) {
            window.location.href = `/l/${course.slug}/lesson/start`;
            return;
        }

        setIsCheckoutOpen(true);
    };

    const handleValidatePromo = async (code: string, itemId: string) => {
        return PromoService.validate(code, undefined, itemId);
    };

    const handleConfirmCourse = async (item: CheckoutItem, promoCode?: string, cipherAmount?: number) => {
        if (!course) return;

        try {
            const result = await initiateCoursePurchase.mutateAsync({
                courseId: course.id,
                provider: "ESEWA",
                promoCode,
                cipherAmount,
            });

            if (result.enrolled) {
                toast.success("Enrolled successfully!");
                window.location.href = `/l/${course.slug}/lesson/start`;
                return;
            }

            if (!result.gatewayUrl || !result.gatewayConfig) {
                throw new Error("Invalid payment initiation response");
            }

            const form = document.createElement("form");
            form.method = "POST";
            form.action = result.gatewayUrl;

            Object.entries(result.gatewayConfig).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            });

            document.body.appendChild(form);
            PaymentSession.start(result.gatewayConfig.transaction_uuid);

            setIsRedirecting(true);
            form.submit();
        } catch (error: any) {
            setIsRedirecting(false);
            toast.error(error?.errorMessage || "Failed to initiate enrollment.");
        }
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

    return (
        <div className="space-y-8 relative">
            <CourseHero course={course} />

            <CourseActionCard
                course={course}
                isPending={initiateCoursePurchase.isPending}
                onEnroll={handleEnrollClick}
                onPreview={handlePreviewClick}
            />

            <div className="space-y-12 pt-4 lg:max-w-[calc(100%-380px)]">
                <CourseCurriculum
                    modules={modules}
                    isLoading={isModulesLoading}
                    isEnrolled={course.isEnrolled}
                    courseSlug={course.slug}
                    courseDuration={course.duration}
                    onPreviewLesson={(id) => setPreviewLessonId(id)}
                />

                <CourseReviews
                    course={course}
                    user={user}
                    reviewsData={reviewsData}
                    fetchNextPage={() => fetchNextPage()}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isSubmitting={submitReviewMutation.isPending}
                    isUpdating={updateReviewMutation.isPending}
                    onSubmitReview={(data) => submitReviewMutation.mutate(data)}
                    onUpdateReview={(data) => updateReviewMutation.mutate(data)}
                    onDeleteReview={(id) => deleteReviewMutation.mutate(id)}
                />

                <div className="h-20 md:hidden" />
            </div>

            <Dialog open={!!previewLessonId} onOpenChange={() => setPreviewLessonId(null)}>
                <DialogContent showCloseButton={false} className="max-w-[95vw] lg:max-w-[1200px] p-0 overflow-hidden bg-black border-white/5 rounded-3xl shadow-[0_0_100px_-20px_rgba(88,101,242,0.5)]">
                    <DialogTitle className="sr-only">Course Preview</DialogTitle>
                    <div className="relative aspect-video group">
                        {previewLessonId && (
                            <VideoPlayer
                                src={`${API_URL?.replace(/\/$/, "")}/courses/lessons/${previewLessonId}/stream/master.m3u8`}
                                title={course.title}
                                token={getAccessToken() || undefined}
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewLessonId(null)}
                            className="absolute top-6 right-6 z-50 h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => {
                    setIsCheckoutOpen(false);
                    setIsRedirecting(false);
                }}
                item={{
                    id: course.id,
                    name: course.title,
                    price: course.price || 0,
                    currency: "Rs",
                    meta: { label: "Enrollment", value: "Full Course Access" }
                }}
                maxCipherDiscount={course.maxCipherDiscount || 0}
                isLoading={initiateCoursePurchase.isPending || isRedirecting}
                onValidatePromo={handleValidatePromo}
                onConfirm={handleConfirmCourse}
            />
        </div >
    );
}
