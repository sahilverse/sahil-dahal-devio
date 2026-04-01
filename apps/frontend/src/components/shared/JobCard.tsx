import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Job } from "@/api/jobService";
import { VerificationBadge } from "../shared/VerificationBadge";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, ArrowUpRight, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface JobCardProps {
    job: Job;
    className?: string;
}

const workplaceConfig = {
    ON_SITE: { label: "On-site", className: "bg-white/5 text-muted-foreground border-white/10" },
    HYBRID: { label: "Hybrid", className: "bg-white/5 text-muted-foreground border-white/10" },
    REMOTE: { label: "Remote", className: "bg-white/5 text-muted-foreground border-white/10" },
};

const typeLabels = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
    REMOTE: "Remote Role",
};

export const JobCard: React.FC<JobCardProps> = ({ job, className }) => {
    return (
        <Link
            href={`/j/${job.slug}`}
            className={cn(
                "group relative block bg-white/[0.02] rounded-3xl border border-white/5 p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
                className
            )}
        >
            <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/30 transition-transform group-hover:scale-105">
                    {job.company?.logoUrl ? (
                        <Image
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 text-brand-primary text-xl font-black uppercase">
                            {job.company?.name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-semibold text-muted-foreground hover:underline">
                                    c/{job.company?.name}
                                </span>
                                {job.company?.verificationTier && (
                                    <VerificationBadge tier={job.company.verificationTier} size="sm" />
                                )}
                            </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2", workplaceConfig[job.workplace].className)}>
                            {workplaceConfig[job.workplace].label}
                        </Badge>
                        <div className="flex items-center gap-0 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-muted-foreground">
                            {typeLabels[job.type]}
                        </div>
                        {job.topics && job.topics.slice(0, 2).map((topic) => (
                            <div
                                key={topic.slug}
                                className="flex items-center gap-0 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold"
                            >
                                <span className="text-brand-primary/60">t/</span>
                                <span className="text-muted-foreground">{topic.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4 text-[11px] text-muted-foreground font-medium">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || (job.workplace === "REMOTE" ? "Global" : "TBD")}
                    </div>
                    {((job.salaryMin ?? 0) > 0 || (job.salaryMax ?? 0) > 0) && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {(job.salaryMin ?? 0) > 0 && job.salaryMin?.toLocaleString()}
                            {(job.salaryMin ?? 0) > 0 && (job.salaryMax ?? 0) > 0 && " - "}
                            {(job.salaryMax ?? 0) > 0 && job.salaryMax?.toLocaleString()}
                            <span className="ml-1 opacity-60 uppercase">{job.currency}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </div>
            </div>

            {/* Border trace animation element */}
            <div className="absolute inset-0 rounded-2xl border border-brand-primary/0 transition-all duration-700 group-hover:border-brand-primary/20 pointer-events-none" />
        </Link>
    );
};
