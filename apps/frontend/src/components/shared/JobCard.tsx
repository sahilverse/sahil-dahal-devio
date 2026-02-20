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
    ON_SITE: { label: "On-site", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    HYBRID: { label: "Hybrid", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    REMOTE: { label: "Remote", className: "bg-green-500/10 text-green-500 border-green-500/20" },
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
                "group relative block bg-card rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-[0_8px_30px_rgba(88,101,242,0.12)] dark:hover:shadow-[0_8px_30px_rgba(88,101,242,0.08)]",
                className
            )}
        >
            <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-1 transition-transform group-hover:scale-105">
                    {job.company?.logoUrl ? (
                        <Image
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            fill
                            className="object-contain p-1"
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
                                    {job.company?.name}
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
                        <Badge variant="secondary" className="text-[10px] uppercase font-black px-2 bg-muted/50">
                            {typeLabels[job.type]}
                        </Badge>
                        {job.topics && job.topics.slice(0, 2).map(({ topic }) => (
                            <Badge key={topic.slug} variant="outline" className="text-[10px] font-bold border-brand-primary/20 text-brand-primary/80 bg-brand-primary/5">
                                t/{topic.name}
                            </Badge>
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
                    {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salaryMin && job.salaryMin.toLocaleString()}
                            {job.salaryMin && job.salaryMax && " - "}
                            {job.salaryMax && job.salaryMax.toLocaleString()}
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
