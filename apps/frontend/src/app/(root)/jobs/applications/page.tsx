"use client";

import React from "react";
import { useFetchMyApplications } from "@/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, ArrowLeft, Loader2 } from "lucide-react";

export default function MyApplicationsPage() {
    const { data: applications, isLoading } = useFetchMyApplications();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "REVIEWING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "SHORTLISTED": return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
            case "ACCEPTED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-muted/30 text-muted-foreground border-border/50";
        }
    };

    return (
        <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/jobs" className="p-2 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black">My Applications</h1>
                    <p className="text-muted-foreground font-medium">Track the status of your job applications.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Loading applications...</p>
                </div>
            ) : !applications || applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                    <div className="bg-brand-primary/10 p-5 rounded-2xl mb-6">
                        <Briefcase className="h-10 w-10 text-brand-primary/60" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No applications yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                        You haven't applied to any jobs yet. Start exploring opportunities!
                    </p>
                    <Link href="/jobs" className="inline-flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-6 py-3 font-bold hover:bg-brand-primary/20 transition-colors">
                        Explore Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Link key={app.id} href={`/j/${app.job?.slug}`}>
                            <Card className="p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] mb-4 transition-all rounded-3xl flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/30">
                                        {app.job?.company?.logoUrl ? (
                                            <Image src={app.job.company.logoUrl} alt={app.job.company.name || "Company"} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 text-brand-primary font-black uppercase">
                                                c/
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-brand-primary transition-colors">
                                            {app.job?.title}
                                        </h3>
                                        <p className="font-semibold text-muted-foreground">
                                            c/{app.job?.company?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                    <Badge variant="outline" className={`px-3 py-1 text-xs font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </Badge>
                                    <span className="text-xs font-bold text-muted-foreground">
                                        Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
