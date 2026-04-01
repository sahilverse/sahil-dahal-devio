"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/store";
import { useFetchJob, useUpdateJob } from "@/hooks/useJobs";
import { useAuthModal } from "@/contexts/AuthModalContext";

import { JobDetailHeader } from "@/components/jobs/details/JobDetailHeader";
import { JobDetailSpecs } from "@/components/jobs/details/JobDetailSpecs";
import { JobDetailContent } from "@/components/jobs/details/JobDetailContent";
import { JobDetailSidebar } from "@/components/jobs/details/JobDetailSidebar";
import { JobDetailSkeleton } from "@/components/jobs/details/JobDetailSkeleton";
import { JobDetailNotFound } from "@/components/jobs/details/JobDetailNotFound";

export default function JobDetailPage() {
    const { slug } = useParams() as { slug: string };
    const { data: job, isLoading } = useFetchJob(slug);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { openLogin } = useAuthModal();
    const updateJob = useUpdateJob();

    if (isLoading) return <JobDetailSkeleton />;
    if (!job) return <JobDetailNotFound />;

    const isCreatorOrRecruiter = !!currentUser && (
        job.authorId === currentUser.id ||
        job.company?.ownerId === currentUser.id ||
        (job.company as any)?.members?.some((m: any) => 
            m.userId === currentUser.id && (m.role === "OWNER" || m.role === "RECRUITER")
        )
    );

    const handleToggleActive = () => {
        if (!job) return;
        updateJob.mutate(
            { id: job.id, data: { isActive: !job.isActive } },
            {
                onSuccess: () => toast.success(job.isActive ? "Job has been unlisted." : "Job is now active.")
            }
        );
    };

    return (
        <div className="container max-w-6xl py-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <JobDetailHeader job={job} />
                    <JobDetailSpecs job={job} />
                    <JobDetailContent job={job} />
                </div>

                {/* Sidebar */}
                <JobDetailSidebar 
                    job={job}
                    currentUser={currentUser}
                    openLogin={openLogin}
                    isCreatorOrRecruiter={isCreatorOrRecruiter}
                    handleToggleActive={handleToggleActive}
                    isUpdatePending={updateJob.isPending}
                />
            </div>
        </div>
    );
}
