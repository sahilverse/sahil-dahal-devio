"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useFetchJob, useFetchJobApplications, useUpdateApplicationStatus } from "@/hooks/useJobs";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    FileText,
    ExternalLink,
    Users,
    CheckCircle2,
    XCircle,
    Star,
    Eye,
    Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PENDING: {
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <Clock className="h-3 w-3" />,
        label: "Pending"
    },
    REVIEWING: {
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: <Eye className="h-3 w-3" />,
        label: "Reviewing"
    },
    SHORTLISTED: {
        color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        icon: <Star className="h-3 w-3" />,
        label: "Shortlisted"
    },
    ACCEPTED: {
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: "Accepted"
    },
    REJECTED: {
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: <XCircle className="h-3 w-3" />,
        label: "Rejected"
    },
};

const TRIAGE_ACTIONS = [
    { status: "REVIEWING", label: "Review", icon: <Eye className="h-3.5 w-3.5" />, className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20" },
    { status: "SHORTLISTED", label: "Shortlist", icon: <Star className="h-3.5 w-3.5" />, className: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/20" },
    { status: "ACCEPTED", label: "Accept", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
    { status: "REJECTED", label: "Reject", icon: <XCircle className="h-3.5 w-3.5" />, className: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" },
];

export default function JobApplicationsDashboard() {
    const { slug } = useParams() as { slug: string };
    const { data: job, isLoading: isJobLoading } = useFetchJob(slug);
    const { data: appsData, isLoading: isAppsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchJobApplications(job?.id || "");
    const updateStatus = useUpdateApplicationStatus();

    const applications = appsData?.pages.flatMap((page) => page.applications) || [];

    if (isJobLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-primary/40" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-3xl font-black">Job Not Found</h1>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl py-10 space-y-8 animate-in fade-in duration-500">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-brand-primary/[0.03] to-transparent backdrop-blur-2xl p-8 md:p-10">
                {/* Mesh gradient orbs */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-primary/10 blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-500/8 blur-[60px] pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <Link href={`/j/${slug}`} className="mt-1 p-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-all active:scale-95">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 border-brand-primary/20 px-3 py-1">
                                    Recruiter Dashboard
                                </Badge>
                                {!job.isActive && (
                                    <Badge variant="destructive" className="text-[10px] font-black uppercase">
                                        Closed
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{job.title}</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-3">
                                <Users className="h-4 w-4 text-brand-primary/60" />
                                {applications.length} applicant{applications.length !== 1 ? "s" : ""} received
                            </p>
                        </div>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                            const count = applications.filter((a: any) => a.status === key).length;
                            if (count === 0) return null;
                            return (
                                <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${config.color}`}>
                                    {config.icon}
                                    {count} {config.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Applications Feed ── */}
            {isAppsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-primary/40" />
                    <p className="font-medium animate-pulse">Loading applicants...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                    <div className="bg-brand-primary/10 p-5 rounded-2xl mb-6">
                        <Users className="h-10 w-10 text-brand-primary/60" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No applications yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        When candidates apply for this position, their details will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {applications.map((app: any) => {
                        const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                        return (
                            <Card
                                key={app.id}
                                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.08)]"
                            >
                                {/* Status accent bar */}
                                <div className={`absolute top-0 left-0 w-1 h-full rounded-l-[2rem] ${app.status === "ACCEPTED" ? "bg-emerald-500" : app.status === "REJECTED" ? "bg-red-500" : app.status === "SHORTLISTED" ? "bg-violet-500" : app.status === "REVIEWING" ? "bg-blue-500" : "bg-amber-500"}`} />

                                <div className="p-6 md:p-8">
                                    {/* ── Top Row: Avatar + Name + Status ── */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 border-2 border-white/[0.08] shadow-lg ring-2 ring-white/[0.04]">
                                                <AvatarImage src={app.user?.avatarUrl || ""} />
                                                <AvatarFallback className="bg-gradient-to-br from-brand-primary/20 to-violet-500/20 text-lg font-black">
                                                    {app.user?.username?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    href={`/u/${app.user?.username}`}
                                                    className="text-lg font-bold hover:text-brand-primary transition-colors flex items-center gap-2 group/link"
                                                >
                                                    {app.user?.firstName} {app.user?.lastName}
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </Link>
                                                <p className="text-sm font-medium text-muted-foreground">u/{app.user?.username}</p>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </Badge>
                                    </div>

                                    {/* ── Cover Letter ── */}
                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5" /> Cover Letter
                                        </h4>
                                        <div className="bg-white/[0.03] rounded-2xl p-5 text-sm text-foreground/80 leading-relaxed border border-white/[0.06] max-h-[180px] overflow-y-auto no-scrollbar">
                                            {app.coverLetter || <span className="text-muted-foreground italic">No cover letter provided.</span>}
                                        </div>
                                    </div>

                                    {/* ── Footer: Date + Resume + Triage Actions ── */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}
                                            </span>
                                            {app.resumeUrl && (
                                                <Button asChild variant="outline" size="sm" className="rounded-xl font-bold bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] h-8">
                                                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                                                        Resume
                                                        <ExternalLink className="ml-1.5 h-3 w-3 text-brand-primary" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Triage Actions */}
                                        <div className="flex items-center gap-2">
                                            {TRIAGE_ACTIONS.map((action) => (
                                                <Button
                                                    key={action.status}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={app.status === action.status || updateStatus.isPending}
                                                    className={`rounded-xl font-bold text-xs h-8 px-3 border transition-all active:scale-95 ${app.status === action.status
                                                        ? action.className + " opacity-100 ring-1 ring-current/20"
                                                        : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:border-white/[0.12] hover:text-foreground"
                                                        }`}
                                                    onClick={() => updateStatus.mutate({ id: app.id, status: action.status })}
                                                >
                                                    {action.icon}
                                                    <span className="ml-1.5 hidden sm:inline">{action.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ── Load More ── */}
            {hasNextPage && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] font-bold px-8 shadow-xl backdrop-blur-sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-primary" />
                                Loading...
                            </>
                        ) : (
                            "Load More Applicants"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
