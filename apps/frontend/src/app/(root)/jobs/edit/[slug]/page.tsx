"use client";

import React from "react";
import PostJobForm from "@/components/jobs/PostJobForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useFetchJob } from "@/hooks/useJobs";

export default function EditJobPage() {
    const { slug } = useParams() as { slug: string };
    const { data: job, isLoading } = useFetchJob(slug);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-primary" />
                <p className="font-medium animate-pulse">Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h1 className="text-3xl font-black mb-4">Job Not Found</h1>
                <Button asChild>
                    <Link href="/jobs">Return to Jobs</Link>
                </Button>
            </div>
        );
    }

    // Format the initial data to match the form structure
    const initialData = {
        title: job.title,
        description: job.description,
        type: job.type,
        workplace: job.workplace,
        companyId: job.companyId,
        location: job.location || "",
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency || "NPR",
        applyLink: job.applyLink || "",
        topics: job.topics?.map((t: any) => t.name) || [], // Assuming TopicSelector handles strings
    };

    return (
        <div className="container max-w-5xl py-6 space-y-10">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="w-fit -ml-4 rounded-xl text-muted-foreground hover:text-foreground">
                    <Link href={`/j/${slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Job Post
                    </Link>
                </Button>

                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight">
                        Edit Job Posting
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Update details for {job.title} at {job.company?.name}.
                    </p>
                </div>
            </div>

            <PostJobForm initialData={initialData} jobId={job.id} />
        </div>
    );
}
