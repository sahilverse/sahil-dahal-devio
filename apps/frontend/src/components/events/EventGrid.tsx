"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { EventService } from "@/api/eventService";
import { EventCard } from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

interface EventGridProps {
    status?: string;
    type?: string;
    communityId?: string;
}

export const EventGrid: React.FC<EventGridProps> = ({ status = "PUBLISHED", type, communityId }) => {
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status: queryStatus,
    } = useInfiniteQuery({
        queryKey: ["events", { status, type, communityId }],
        queryFn: ({ pageParam }) =>
            EventService.getEvents({
                cursor: pageParam as unknown as string,
                limit: 10,
                status,
                type,
                communityId,
            }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    React.useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (queryStatus === "pending") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (queryStatus === "error") {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Error loading events. Please try again later.</p>
            </div>
        );
    }

    const events = data?.pages.flatMap((page) => page.events) || [];

    if (events.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
                <div className="bg-muted p-4 rounded-full">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold">No events found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {hasNextPage && (
                <div ref={ref} className="py-8 flex justify-center">
                    {isFetchingNextPage && (
                        <div className="flex gap-2">
                            <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
                            <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
