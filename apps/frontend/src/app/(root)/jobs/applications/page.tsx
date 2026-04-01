"use client";

import React from "react";
import { useFetchMyApplications } from "@/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
    Briefcase,
    ArrowLeft,
    Loader2,
    Clock,
    Eye,
    Star,
    CheckCircle2,
    XCircle,
    ExternalLink,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string; accentBar: string }> = {
    PENDING: {
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <Clock className="h-3 w-3" />,
        label: "Pending",
        accentBar: "bg-amber-500",
    },
    REVIEWING: {
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: <Eye className="h-3 w-3" />,
        label: "Reviewing",
        accentBar: "bg-blue-500",
    },
    SHORTLISTED: {
        color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        icon: <Star className="h-3 w-3" />,
        label: "Shortlisted",
        accentBar: "bg-violet-500",
    },
    ACCEPTED: {
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: "Accepted",
        accentBar: "bg-emerald-500",
    },
    REJECTED: {
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: <XCircle className="h-3 w-3" />,
        label: "Rejected",
        accentBar: "bg-red-500",
    },
};

export default function MyApplicationsPage() {
    const { data: appsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchMyApplications();

    const applications = appsData?.pages.flatMap((page) => page.applications) || [];

    return (
        <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
            {/* ── Glassmorphic Hero Header ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-brand-primary/[0.03] to-transparent backdrop-blur-2xl p-8 md:p-10">
                {/* Mesh gradient orbs */}
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-primary/10 blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-violet-500/8 blur-[60px] pointer-events-none" />

                <div className="relative flex items-start gap-4">
                    <Link href="/jobs" className="mt-1 p-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-all active:scale-95">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 border-brand-primary/20 px-3 py-1">
                            Application Tracker
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Applications</h1>
                        <p className="text-muted-foreground font-medium">
                            Track the status of your job applications in real-time.
                        </p>

                        {/* Status summary pills */}
                        {applications.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
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
                        )}
                    </div>
                </div>
            </div>

            {/* ── Applications Feed ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-primary/40" />
                    <p className="font-medium animate-pulse">Loading applications...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                    <div className="bg-brand-primary/10 p-5 rounded-2xl mb-6">
                        <Briefcase className="h-10 w-10 text-brand-primary/60" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No applications yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                        You haven&apos;t applied to any jobs yet. Start exploring opportunities!
                    </p>
                    <Link href="/jobs" className="inline-flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-6 py-3 font-bold hover:bg-brand-primary/20 transition-colors">
                        Explore Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app: any) => {
                        const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                        return (
                            <Link key={app.id} href={`/j/${app.job?.slug}`}>
                                <Card className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(99,102,241,0.08)] mb-4">
                                    {/* Status accent bar */}
                                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-[2rem] ${statusConfig.accentBar}`} />

                                    <div className="p-6 flex flex-col md:flex-row gap-5 md:items-center justify-between">
                                        {/* Left: Company logo + Job info */}
                                        <div className="flex items-center gap-5">
                                            <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-lg">
                                                {app.job?.company?.logoUrl ? (
                                                    <Image src={app.job.company.logoUrl} alt={app.job.company.name || "Company"} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-primary/20 to-violet-500/20 text-brand-primary font-black text-sm uppercase">
                                                        {app.job?.company?.name?.charAt(0) || "C"}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-brand-primary transition-colors flex items-center gap-2">
                                                    {app.job?.title}
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </h3>
                                                <p className="font-semibold text-sm text-muted-foreground">
                                                    c/{app.job?.company?.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Status badge + time */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                                            <Badge variant="outline" className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusConfig.color}`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </Badge>
                                            <span className="text-xs font-bold text-muted-foreground">
                                                Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
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
                            "Load More Applications"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
