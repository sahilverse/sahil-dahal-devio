"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useFetchJob } from "@/hooks/useJobs";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import {
    Briefcase,
    MapPin,
    DollarSign,
    ExternalLink,
    Share2,
    Clock,
    Globe,
    ChevronRight,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Edit3 } from "lucide-react";

export default function JobDetailPage() {
    const { slug } = useParams() as { slug: string };
    const { data: job, isLoading } = useFetchJob(slug);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { openLogin } = useAuthModal();

    if (isLoading) return <JobDetailSkeleton />;
    if (!job) return <JobNotFound />;

    const isCreatorOrRecruiter = currentUser && (
        job.authorId === currentUser.id ||
        job.company?.ownerId === currentUser.id ||
        (job.company as any)?.members?.some((m: any) => m.userId === currentUser.id && (m.role === "OWNER" || m.role === "RECRUITER"))
    );

    const workplaceLabels = {
        ON_SITE: "On-site",
        HYBRID: "Hybrid",
        REMOTE: "Remote",
    };

    const typeLabels = {
        FULL_TIME: "Full-time",
        PART_TIME: "Part-time",
        CONTRACT: "Contract",
        FREELANCE: "Freelance",
        INTERNSHIP: "Internship",
    };

    return (
        <div className="container max-w-6xl py-6 space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumbs / Back */}
            <div className="flex items-center justify-between">
                <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground truncate max-w-[200px]">{job.title}</span>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl size-10">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
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

                        {/* Quick Specs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SpecCard
                                icon={<MapPin className="size-4" />}
                                label="Location"
                                value={job.location || (job.workplace === "REMOTE" ? "Global / Remote" : "TBD")}
                            />
                            <SpecCard
                                icon={<Briefcase className="size-4" />}
                                label="Job Type"
                                value={typeLabels[job.type as keyof typeof typeLabels] || job.type}
                            />
                            <SpecCard
                                icon={<Globe className="size-4" />}
                                label="Workplace"
                                value={workplaceLabels[job.workplace as keyof typeof workplaceLabels] || job.workplace}
                            />
                            <SpecCard
                                icon={<DollarSign className="size-4" />}
                                label="Compensation"
                                value={job.salaryMin || job.salaryMax ?
                                    `${job.salaryMin ? job.salaryMin.toLocaleString() : "..."} - ${job.salaryMax ? job.salaryMax.toLocaleString() : "..."}` :
                                    "Undisclosed"}
                            />
                        </div>
                    </section>

                    <div className="prose prose-invert max-w-none bg-card/40 border border-border/40 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <Sparkles className="size-5 text-brand-primary" />
                            Role Overview
                        </h3>
                        <MarkdownContent content={job.description} />
                    </div>

                    {/* Topics / Skills */}
                    {job.topics && job.topics.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Relevant Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.topics.map(({ topic }: any) => (
                                    <Link
                                        key={topic.slug}
                                        href={`/t/${topic.slug}`}
                                        className="inline-flex items-center rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-2 text-sm font-bold text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95"
                                    >
                                        t/{topic.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Apply Card */}
                    <Card className="p-6 border-brand-primary/20 bg-brand-primary/[0.03] backdrop-blur-md rounded-3xl sticky top-28 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black">{isCreatorOrRecruiter ? "Manage your posting" : "Ready to apply?"}</h3>
                            <p className="text-sm text-muted-foreground font-medium">
                                {isCreatorOrRecruiter
                                    ? "As a recruiter, you can modify the job details or view applicants."
                                    : "This position is verified and actively accepting applications."}
                            </p>
                        </div>

                        {isCreatorOrRecruiter ? (
                            <Button asChild size="lg" className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 text-lg group">
                                <Link href={`/jobs/edit/${job.id}`}>
                                    Edit Job Posting
                                    <Edit3 className="ml-2 h-5 w-5" />
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
            </div>
        </div>
    );
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <Card className="p-4 border-border/40 bg-card/40 backdrop-blur-sm rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-brand-primary/60">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xs font-black truncate">{value}</p>
        </Card>
    );
}

function JobDetailSkeleton() {
    return (
        <div className="container max-w-6xl py-10 space-y-8">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4 rounded-xl" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                    </div>
                    <Skeleton className="h-[400px] rounded-[2.5rem]" />
                </div>
                <Skeleton className="h-96 rounded-3xl" />
            </div>
        </div>
    );
}

function JobNotFound() {
    return (
        <div className="container py-20 text-center space-y-6">
            <div className="bg-brand-primary/10 p-6 rounded-full w-fit mx-auto">
                <Briefcase className="h-12 w-12 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black">Position Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                This job posting may have expired or was removed by the employer.
            </p>
            <Button asChild className="rounded-xl">
                <Link href="/j">Return to Job Board</Link>
            </Button>
        </div>
    );
}
