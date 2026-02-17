"use client";

import React, { Suspense } from "react";
import CreateEventForm from "@/components/events/CreateEventForm";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CreateEventContent: React.FC = () => {
    const searchParams = useSearchParams();
    const communityId = searchParams.get("communityId") || undefined;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/events">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-brand-primary pl-0 cursor-pointer group transition-colors">
                        <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Discover
                    </Button>
                </Link>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Host an Event</h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Organize hackathons, workshops, or contests for your community members.
                    </p>
                </div>
            </div>

            {/* Info Message */}
            {!communityId && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-primary font-bold text-sm">Community Requirement</h4>
                        <p className="text-xs text-muted-foreground">
                            For now, all events must be hosted by a community. You must be a moderator of the community to create an event.
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <CreateEventForm initialCommunityId={communityId} />

            {/* Support Box */}
            <div className="p-6 bg-muted/30 rounded-3xl border border-dashed border-border/50 flex items-start gap-4">
                <div className="bg-background p-3 rounded-2xl border border-border/50">
                    <ShieldAlert className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold">Need help with sponsorship?</h4>
                    <p className="text-sm text-muted-foreground">
                        We can help you find sponsors for your hackathons or provide platform-wide promotion.
                        Reach out to the Devio Admin team for more information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function CreateEventPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateEventContent />
        </Suspense>
    );
}
