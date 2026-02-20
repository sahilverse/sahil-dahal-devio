"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetchJob } from "@/hooks/useJobs";
import {
    ChevronLeft,
    Send,
    FileText,
    Link as LinkIcon,
    AlertCircle,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { JobService } from "@/api/jobService";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ApplyJobPage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const { data: job, isLoading } = useFetchJob(slug);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    const [coverLetter, setCoverLetter] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) return <ApplyJobSkeleton />;
    if (!job) return <JobNotFound />;

    const isCreatorOrRecruiter = currentUser && (
        job.authorId === currentUser.id ||
        job.company?.ownerId === currentUser.id ||
        (job.company as any)?.members?.some((m: any) => m.userId === currentUser.id && (m.role === "OWNER" || m.role === "RECRUITER"))
    );

    if (isCreatorOrRecruiter) {
        return (
            <div className="container max-w-2xl py-20 text-center space-y-6">
                <div className="bg-yellow-500/10 p-6 rounded-full w-fit mx-auto text-yellow-500">
                    <AlertCircle className="h-12 w-12" />
                </div>
                <h1 className="text-2xl font-black">Restricted Action</h1>
                <p className="text-muted-foreground">
                    As the creator or recruiter for this position, you cannot apply to it.
                </p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!coverLetter.trim()) {
            toast.error("Please provide a cover letter or introduction.");
            return;
        }

        setIsSubmitting(true);
        try {
            await JobService.apply(job.id, {
                coverLetter,
                resumeUrl: resumeUrl.trim() || undefined
            });
            toast.success("Application submitted successfully!");
            router.push(`/j/${job.slug}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-2xl py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                href={`/j/${job.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Role Details
            </Link>

            <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Apply for this role</h1>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="size-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <FileText className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black">{job.title}</p>
                        <p className="text-xs text-muted-foreground font-medium">at c/{job.company?.name}</p>
                    </div>
                </div>
            </div>

            <Card className="p-8 border-border/40 bg-card/60 backdrop-blur-md rounded-[2rem] shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Cover Letter / Introduction
                        </label>
                        <Textarea
                            placeholder="Tell the team why you're a great fit for this role..."
                            className="min-h-[250px] rounded-2xl border-border/40 bg-muted/10 p-6 focus:ring-brand-primary placeholder:text-muted-foreground/50 leading-relaxed text-base"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            required
                        />
                        <p className="text-[10px] text-muted-foreground font-medium ml-1">
                            Tip: Highlight your most relevant experience and why you're interested in c/{job.company?.name}.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Resume URL (Optional)
                        </label>
                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                            <Input
                                placeholder="Link to your resume (Drive, Dropbox, etc.)"
                                className="h-14 pl-12 rounded-xl border-border/40 bg-muted/10 focus:ring-brand-primary"
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Submit Application
                            </>
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
}

function ApplyJobSkeleton() {
    return (
        <div className="container max-w-2xl py-10 space-y-8">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-[2rem]" />
        </div>
    );
}

function JobNotFound() {
    return (
        <div className="container py-20 text-center space-y-6">
            <h1 className="text-2xl font-black">Position Not Found</h1>
            <Button asChild>
                <Link href="/j">Back to Jobs</Link>
            </Button>
        </div>
    );
}
