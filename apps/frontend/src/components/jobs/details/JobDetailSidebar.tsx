import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
    Users, 
    Edit3, 
    EyeOff, 
    Eye, 
    ExternalLink, 
    ChevronRight, 
    Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { Job } from "@/api/jobService";
import { STATUS_CONFIG } from "./JobDetailConstants";

interface JobDetailSidebarProps {
    job: Job;
    currentUser: any;
    openLogin: () => void;
    isCreatorOrRecruiter: boolean;
    handleToggleActive: () => void;
    isUpdatePending: boolean;
}

export function JobDetailSidebar({
    job,
    currentUser,
    openLogin,
    isCreatorOrRecruiter,
    handleToggleActive,
    isUpdatePending
}: JobDetailSidebarProps) {
    const hasApplied = job.hasApplied;

    return (
        <div className="space-y-6">
            {/* Apply Card */}
            <Card className="p-6 border-brand-primary/20 bg-brand-primary/[0.03] backdrop-blur-md rounded-3xl sticky top-28 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-black">
                            {isCreatorOrRecruiter
                                ? "Manage your posting"
                                : !job.isActive
                                    ? "Position Closed"
                                    : hasApplied
                                        ? "Application Status"
                                        : "Ready to apply?"}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            {isCreatorOrRecruiter
                                ? "As a recruiter, you can modify the job details or view applicants."
                                : !job.isActive
                                    ? "This position is no longer accepting new applications."
                                    : hasApplied
                                        ? "Track your progress for this application below."
                                        : "This position is verified and actively accepting applications."}
                        </p>
                    </div>

                    {hasApplied && job.applicationStatus && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${STATUS_CONFIG[job.applicationStatus]?.color || ""}`}>
                            <div className="p-2 rounded-full bg-current/10">
                                {STATUS_CONFIG[job.applicationStatus]?.icon || <Clock className="size-4" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Status</p>
                                <p className="text-sm font-bold uppercase tracking-tight">
                                    {STATUS_CONFIG[job.applicationStatus]?.label || "Pending"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {isCreatorOrRecruiter ? (
                    <div className="space-y-3">
                        <Button asChild size="lg" className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-md group">
                            <Link href={`/j/${job.slug}/applications`}>
                                View Applicants
                                <Users className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline" className="w-full h-12 border-border/50 bg-background/50 hover:bg-background font-bold rounded-xl">
                                <Link href={`/jobs/edit/${job.slug}`}>
                                    Edit Post
                                    <Edit3 className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant={job.isActive ? "destructive" : "secondary"}
                                className="w-full h-12 font-bold rounded-xl"
                                onClick={handleToggleActive}
                                disabled={isUpdatePending}
                            >
                                {job.isActive ? "Unlist Job" : "Re-list Job"}
                                {job.isActive ? <EyeOff className="ml-2 h-4 w-4" /> : <Eye className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                ) : !job.isActive ? (
                    <Button disabled size="lg" className="w-full h-14 bg-muted text-muted-foreground font-black rounded-2xl text-lg">
                        Not Accepting Applications
                    </Button>
                ) : hasApplied ? (
                    <Button asChild variant="outline" size="lg" className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 font-black rounded-2xl shadow-xl text-lg">
                        <Link href="/jobs/applications">
                            View My Applications
                            <ExternalLink className="ml-2 h-4 w-4 text-brand-primary" />
                        </Link>
                    </Button>
                ) : !currentUser ? (
                    <Button
                        size="lg"
                        className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg group"
                        onClick={openLogin}
                    >
                        Sign in to Apply
                        <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                ) : job.applyLink ? (
                    <Button asChild size="lg" className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg group">
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                            Apply on External Site
                            <ExternalLink className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </a>
                    </Button>
                ) : (
                    <Button asChild size="lg" className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg group">
                        <Link href={`/j/${job.slug}/apply`}>
                            Apply for this Role
                            <ChevronRight className="ml-1 h-5 w-5" />
                        </Link>
                    </Button>
                )}

                <div className="pt-4 border-t border-border/40 space-y-6">
                    {/* Company Preview */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">About the Recruiter</h4>
                        <div className="flex items-center gap-4">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/30">
                                {job.company?.logoUrl ? (
                                    <Image src={job.company.logoUrl} alt={job.company.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 text-brand-primary font-black uppercase">
                                        c/
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/c/${job.company?.slug}`} className="font-bold text-foreground hover:text-brand-primary transition-colors block truncate">
                                    c/{job.company?.name}
                                </Link>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                    {job.company?.verificationTier && <VerificationBadge tier={job.company.verificationTier} size="sm" />}
                                    {job.company?.verificationTier?.replace("_", " ")}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {job.company?.description}
                        </p>
                        <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-bold bg-muted/5 border-border/40">
                            <Link href={`/c/${job.company?.slug}`}>
                                View Company Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
