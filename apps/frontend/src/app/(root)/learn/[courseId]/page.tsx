"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

const VideoPlayer = dynamic(() => import("@/components/video/VideoPlayer").then(mod => mod.VideoPlayer), {
    ssr: false,
    loading: () => <div className="aspect-video w-full rounded-2xl bg-black flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>
});

export default function CourseLandingPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const router = useRouter();
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();

    const initiateCoursePurchase = useInitiateCoursePurchase();

    const { data: course, isLoading, error } = useQuery({
        queryKey: ["course", courseId, user?.id],
        queryFn: () => courseService.getCourseBySlug(courseId),
        enabled: !!courseId,
    });

    const { data: modules, isLoading: isModulesLoading } = useQuery({
        queryKey: ["course-modules", course?.id],
        queryFn: () => courseService.getCourseModules(course!.id),
        enabled: !!course?.id,
    });

    const { data: reviewsData, refetch: refetchReviews } = useQuery({
        queryKey: ["course-reviews", course?.id],
        queryFn: () => courseService.getCourseReviews(course!.id, { limit: 10 }),
        enabled: !!course?.id,
    });

    const submitReviewMutation = useMutation({
        mutationFn: (data: { rating: number; comment: string }) => courseService.postCourseReview(course!.id, data),
        onSuccess: () => {
            toast.success("Review submitted!");
            setUserRating(0);
            setReviewComment("");
            refetchReviews();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to submit review.");
        },
    });

    const handlePreviewClick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

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

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleEnrollClick = () => {
        if (!user) {
            openLogin();
            return;
        }

        if (!course) return;

        if (course.price === 0 || !course.price) {
            window.location.href = `/learn/${course.slug}/lesson/start`;
            return;
        }

        setIsCheckoutOpen(true);
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

            // If it's a direct enrollment (price was 0 after discount)
            if (result.enrolled) {
                toast.success("Enrolled successfully!");
                window.location.href = `/learn/${course.slug}/lesson/start`;
                return;
            }

            // Otherwise, redirect to payment gateway
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
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 p-8 rounded-3xl border border-border/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center min-h-[320px] lg:w-[calc(100%-380px)]">
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
                            <span className="font-bold text-slate-100">{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span> ({course.reviewCount} reviews)
                        </div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.enrollmentCount} students</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration ? (course.duration / 3600).toFixed(1) : "0"} total hours</div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Card */}
            <div className="w-full md:w-[340px] bg-card text-card-foreground rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-border/50 shrink-0 z-20 hidden md:block lg:absolute lg:right-0 lg:top-0 animate-in slide-in-from-right-4 duration-500">

                <div
                    className="aspect-video relative flex items-center justify-center group cursor-pointer overflow-hidden rounded-t-2xl"
                    onClick={(e) => handlePreviewClick(e)}
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
                                    handleEnrollClick();
                                }
                            }}
                            disabled={initiateCoursePurchase.isPending}
                        >
                            {initiateCoursePurchase.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
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

            {/* Content Body */}
            <div className="space-y-12 pt-4 lg:max-w-[calc(100%-380px)]">
                <div className="space-y-12">

                    {/* Syllabus Accordion */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-3xl font-black tracking-tight">Course Content</h2>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {modules?.items?.length || 0} Modules • {course.duration ? `${Math.floor(course.duration / 3600)}h ${Math.floor((course.duration % 3600) / 60)}m` : '0h 0m'}
                            </p>
                        </div>

                        <div className="border border-border/50 rounded-3xl overflow-hidden bg-card/20 shadow-sm transition-all">
                            {isModulesLoading ? (
                                <div className="p-12 flex flex-col items-center gap-4">
                                    <Loader2 className="size-8 animate-spin text-primary" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Syllabus...</p>
                                </div>
                            ) : modules?.items?.map((module) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <div key={module.id} className="border-b border-border/50 last:border-0 group">
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full flex items-center justify-between p-6 hover:bg-card/80 transition-all text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center transition-colors duration-300">
                                                    {isExpanded ? <ChevronUp className="size-4 text-primary" /> : <ChevronDown className="size-4 text-primary" />}
                                                </div>
                                                <h3 className="font-extrabold text-lg">{module.title}</h3>
                                            </div>
                                            <span className="text-sm font-bold text-muted-foreground">{module.lessonCount || 0} Lessons</span>
                                        </button>

                                        {isExpanded && module.lessons && (
                                            <div className="bg-background/20 px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                                {module.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-4 pl-12 hover:bg-card rounded-2xl transition-colors cursor-pointer group">
                                                        <div
                                                            className="flex items-center gap-4 flex-1"
                                                            onClick={() => {
                                                                if (course.isEnrolled) {
                                                                    router.push(`/learn/${course.slug}/lesson/${lesson.id}`);
                                                                } else if (lesson.isPreview) {
                                                                    setPreviewLessonId(lesson.id);
                                                                }
                                                            }}
                                                        >
                                                            {lesson.type === 'VIDEO' ? <PlayCircle className="size-4 text-primary" /> : <FileText className="size-4" />}
                                                            <span className="text-sm font-semibold group-hover:text-primary transition-colors">{lesson.title}</span>
                                                            {lesson.isPreview && !course.isEnrolled && <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-bold bg-green-500/10 text-green-600 border-none cursor-pointer hover:bg-green-500/20">Preview</Badge>}
                                                        </div>

                                                        <span className="text-xs font-bold text-muted-foreground">
                                                            {lesson.duration ? (lesson.duration < 60 ? `${lesson.duration}s` : `${Math.floor(lesson.duration / 60)}m`) : "10m"}
                                                        </span>
                                                    </div>
                                                ))}
                                                {module.lessons.length === 0 && (
                                                    <div className="p-4 pl-12 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50 italic">
                                                        No lessons yet
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Details */}
                {/* Reviews Section */}
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

                        {course.isEnrolled && !reviewsData?.items?.some(r => r.user?.id === user?.id) && (
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
                                                disabled={submitReviewMutation.isPending || !reviewComment.trim()}
                                                onClick={() => submitReviewMutation.mutate({ rating: userRating, comment: reviewComment })}
                                                className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-primary hover:bg-primary/90 transition-all shadow-[0_15px_30px_-10px_rgba(88,101,242,0.3)] border border-primary/20"
                                            >
                                                {submitReviewMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                                                Transmit Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {reviewsData?.items.map((review) => (
                            <div key={review.id} className="p-8 rounded-[2.5rem] bg-card/10 border border-border/5 hover:border-primary/10 transition-all group backdrop-blur-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={review.user?.avatarUrl || `https://ui-avatars.com/api/?name=${review.user?.username}`}
                                            className="size-12 rounded-2xl border-2 border-border/50 group-hover:scale-110 transition-transform duration-500"
                                            alt={review.user?.username}
                                        />
                                        <div className="space-y-0.5">
                                            <p className="font-black text-[11px] text-primary tracking-widest uppercase">{review.user?.username}</p>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`size-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <p className="text-sm font-medium leading-relaxed tracking-tight text-foreground/80 pl-2 border-l-2 border-primary/10 italic">
                                    &ldquo;{review.comment}&rdquo;
                                </p>
                            </div>
                        ))}
                        {(!reviewsData?.items || reviewsData.items.length === 0) && (
                            <div className="md:col-span-2 py-24 text-center space-y-6">
                                <div className="size-20 mx-auto rounded-[30px] bg-muted/5 flex items-center justify-center border border-border/5 border-dashed">
                                    <Star className="size-8 text-muted-foreground/10" />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">The narrative remains unscribed.</p>
                            </div>
                        )}
                    </div>
                </section>
                <div className="h-20 md:hidden" /> {/* Mobile Spacer */}
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

            {/* Checkout Modal Integration */}
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
                onConfirm={handleConfirmCourse}
            />

            {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                    className="w-full py-6 text-base font-black shadow-xl rounded-xl cursor-pointer"
                    size="lg"
                    onClick={() => {
                        if (course.isEnrolled) {
                            router.push(`/learn/${course.slug}/lesson/start`);
                        } else {
                            handleEnrollClick();
                        }
                    }}
                    disabled={initiateCoursePurchase.isPending}
                >
                    {initiateCoursePurchase.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    {course.isEnrolled ? "Go to Course" : `Enroll Now • Rs ${course.price || 0}`}
                </Button>
            </div>
        </div >
    );
}

// Minimal placeholder component for types/icons if needed by the system
const Trophy = ({ className }: { className?: string }) => < Star className={className} />;
