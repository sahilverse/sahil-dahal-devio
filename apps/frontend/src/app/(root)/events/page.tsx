"use client";

import React, { useState } from "react";
import { EventGrid } from "@/components/events/EventGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Plus, Trophy, Users, Info } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

const EVENT_TYPES = [
    { label: "All Types", value: undefined },
    { label: "Hackathons", value: "HACKATHON" },
    { label: "CTFs", value: "CTF" },
    { label: "Contests", value: "CONTEST" },
    { label: "Workshops", value: "WORKSHOP" },
    { label: "Meetups", value: "MEETUP" },
];

const EVENT_STATUSES = [
    { label: "Upcoming", value: "PUBLISHED" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
];

export default function EventsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
    const [selectedStatus, setSelectedStatus] = useState<string>("PUBLISHED");

    return (
        <div className="space-y-6 lg:pr-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Calendar className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative z-10 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="size-8 text-primary" />
                        Explore Events
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Join hackathons, contests, and workshops to boost your skills and earn rewards.
                    </p>
                </div>

                <div className="relative z-10 flex gap-2">
                    <Link href="/events/create">
                        <Button className="font-bold shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats / Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">Win Prizes</p>
                        <p className="text-xs text-muted-foreground">Top performers earn rewards</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Users className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Collaborate</p>
                        <p className="text-xs text-muted-foreground">Join teams and hack together</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card/40 p-3 rounded-xl border border-border/40 text-sm">
                    <div className="p-2 bg-muted/50 rounded-lg">
                        <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Earn Aura</p>
                        <p className="text-xs text-muted-foreground">Boost your profile reputation</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground">
                        <Filter className="w-3 h-3" />
                        STATUS
                    </div>
                    {EVENT_STATUSES.map((status) => (
                        <Badge
                            key={status.value}
                            variant={selectedStatus === status.value ? "default" : "outline"}
                            className="cursor-pointer py-1.5 px-4 transition-all hover:border-primary/50"
                            onClick={() => setSelectedStatus(status.value)}
                        >
                            {status.label}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground text-nowrap">
                        <Filter className="w-3 h-3" />
                        TYPE
                    </div>
                    {EVENT_TYPES.map((type) => (
                        <Badge
                            key={type.value || "all"}
                            variant={selectedType === type.value ? "default" : "outline"}
                            className="cursor-pointer py-1.5 px-4 transition-all hover:border-primary/50"
                            onClick={() => setSelectedType(type.value)}
                        >
                            {type.label}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Event Grid */}
            <EventGrid
                status={selectedStatus}
                type={selectedType}
            />
        </div>
    );
}
