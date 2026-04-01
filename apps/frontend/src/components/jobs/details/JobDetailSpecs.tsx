import React from "react";
import { MapPin, Briefcase, Globe, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Job } from "@/api/jobService";
import { typeLabels, workplaceLabels } from "./JobDetailConstants";

interface JobDetailSpecsProps {
    job: Job;
}

export function JobDetailSpecs({ job }: JobDetailSpecsProps) {
    return (
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
                value={((job.salaryMin ?? 0) > 0 || (job.salaryMax ?? 0) > 0) ?
                    `${(job.salaryMin ?? 0) > 0 ? job.salaryMin!.toLocaleString() : "..."} - ${(job.salaryMax ?? 0) > 0 ? job.salaryMax!.toLocaleString() : "..."} ${job.currency}` :
                    "Undisclosed"}
            />
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
