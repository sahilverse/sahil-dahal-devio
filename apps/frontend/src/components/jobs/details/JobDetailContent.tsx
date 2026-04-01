import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Job } from "@/api/jobService";

interface JobDetailContentProps {
    job: Job;
}

export function JobDetailContent({ job }: JobDetailContentProps) {
    return (
        <div className="space-y-8">
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
                        {job.topics.map((topic: any) => (
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
    );
}
