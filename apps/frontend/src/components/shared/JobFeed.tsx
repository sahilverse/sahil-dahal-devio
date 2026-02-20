import React from "react";
import { JobCard } from "./JobCard";
import { Job } from "@/api/jobService";
import { Loader2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobFeedProps {
    jobs?: Job[];
    isLoading: boolean;
    className?: string;
}

export const JobFeed: React.FC<JobFeedProps> = ({ jobs, isLoading, className }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary/40" />
                <p className="text-sm font-medium animate-pulse">Scanning the board for opportunities...</p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/60 rounded-3xl bg-muted/5">
                <div className="bg-brand-primary/10 p-5 rounded-2xl mb-6">
                    <Briefcase className="h-10 w-10 text-brand-primary/60" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    We couldn't find any job postings matching your current criteria. Try adjusting your filters.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-1 gap-4", className)}>
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
};
