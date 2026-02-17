"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/api/eventService";
import CreateEventForm from "@/components/events/CreateEventForm";
import { ChevronLeft, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ["event", slug],
        queryFn: () => EventService.getEventById(slug),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading event data...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center py-20">
                <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Event not found</h1>
                <p className="text-muted-foreground mt-2">Could not retrieve event information for editing.</p>
                <Link href="/events">
                    <Button variant="outline" className="mt-6">Back to Events</Button>
                </Link>
            </div>
        );
    }

    if (!event.canEdit) {
        return (
            <div className="text-center py-20">
                <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to edit this event.</p>
                <Link href={`/events/${slug}`}>
                    <Button variant="outline" className="mt-6">Back to Event</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href={`/events/${slug}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-brand-primary pl-0 cursor-pointer group transition-colors">
                        <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Event Details
                    </Button>
                </Link>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Edit Event</h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Update your event information, rules, or schedule.
                    </p>
                </div>
            </div>

            {/* Form */}
            <CreateEventForm
                initialData={event}
                isEditing={true}
                initialCommunityId={event.communityId || event.community?.id}
            />
        </div>
    );
}
