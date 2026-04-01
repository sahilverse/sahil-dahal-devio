import React from "react";
import Link from "next/link";
import { ChevronRight, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Job } from "@/api/jobService";

interface JobDetailHeaderProps {
    job: Job;
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground truncate max-w-[200px]">{job.title}</span>
                </nav>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl size-10 active:scale-95 transition-transform"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <section className="space-y-6">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                        {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link href={`/c/${job.company?.slug}`} className="flex items-center gap-2 text-foreground hover:text-brand-primary transition-colors group">
                            <span className="font-bold underline decoration-border/50 underline-offset-4 group-hover:decoration-brand-primary/30">
                                c/{job.company?.name}
                            </span>
                            {job.company?.verificationTier && (
                                <VerificationBadge tier={job.company.verificationTier} size="sm" />
                            )}
                        </Link>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="size-4 text-brand-primary/60" />
                            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
