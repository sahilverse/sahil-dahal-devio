"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventService } from "@/api/eventService";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
    Calendar,
    MapPin,
    Users,
    Trophy,
    ChevronLeft,
    ExternalLink,
    Clock,
    ShieldAlert,
    Star,
    Share2,
    Info,
    LayoutList,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationDialog } from "@/components/events/RegistrationDialog";
import { LeaderboardTable } from "@/components/events/LeaderboardTable";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import ManageEventProblems from "@/components/events/ManageEventProblems";

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const { data: event, isLoading, error, refetch } = useQuery({
        queryKey: ["event", slug],
        queryFn: () => EventService.getEventById(slug),
    });

    const { data: leaderboard } = useQuery({
        queryKey: ["leaderboard", event?.id],
        queryFn: () => EventService.getLeaderboard(event.id),
        enabled: !!event?.id,
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse lg:pr-50">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center py-20 lg:pr-50">
                <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Event not found</h1>
                <p className="text-muted-foreground mt-2">The event you are looking for does not exist or has been removed.</p>
                <Link href="/events">
                    <Button variant="outline" className="mt-6">Back to Events</Button>
                </Link>
            </div>
        );
    }

    const isOngoing = event.status === "ONGOING";
    const startDate = new Date(event.startsAt);
    const endDate = new Date(event.endsAt);

    return (
        <div className="space-y-8 lg:pr-50 pb-20">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Link href="/events">
                    <Button variant="ghost" size="sm" className="hover:bg-muted text-muted-foreground">
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Discover
                    </Button>
                </Link>
                <div className="flex gap-2">
                    {event.canEdit && (
                        <Link href={`/events/${event.slug}/edit`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <LayoutList className="h-4 w-4" /> Edit Event
                            </Button>
                        </Link>
                    )}
                    <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                        {event.imageUrl ? (
                            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Calendar className="w-20 h-20 text-muted-foreground/30" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant={isOngoing ? "default" : "secondary"} className="shadow-lg backdrop-blur-md bg-background/80 text-foreground">
                                {event.status}
                            </Badge>
                            <Badge className="shadow-lg">{event.type}</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link href={`/c/${event.community?.name}`} className="flex items-center gap-2 group">
                            {event.community?.iconUrl && (
                                <Image src={event.community.iconUrl} alt={event.community.name} width={24} height={24} className="rounded-full ring-2 ring-primary/20" />
                            )}
                            <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                Host: d/{event.community?.name}
                            </span>
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight">{event.title}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{format(startDate, "MMM d, h:mm a")} - {format(endDate, "MMM d, h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
                                <Users className="w-4 h-4 text-primary" />
                                <span>{event.participantCount || 0} Participants</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto scrollbar-none gap-2 h-12 rounded-xl">
                            <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">About</TabsTrigger>
                            {event.type === "CONTEST" && (
                                <TabsTrigger value="problems" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">Problems</TabsTrigger>
                            )}
                            <TabsTrigger value="prizes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">Prizes</TabsTrigger>
                            <TabsTrigger value="leaderboard" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">Leaderboard</TabsTrigger>
                        </TabsList>

                        <TabsContent value="about" className="mt-6">
                            <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-muted-foreground">
                                <MarkdownContent content={event.description} />
                            </div>
                        </TabsContent>

                        <TabsContent value="prizes" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {event.prizes?.length > 0 ? (
                                    event.prizes.map((prize: any) => (
                                        <div key={prize.id} className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-yellow-500/10 p-4 rounded-2xl">
                                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{prize.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{prize.description}</p>
                                                    {prize.prizeValue && <p className="text-primary font-bold mt-1">${prize.prizeValue}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-10 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground font-medium">
                                        No prize details available yet.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="leaderboard" className="mt-6">
                            <LeaderboardTable participants={leaderboard || []} />
                        </TabsContent>

                        {event.type === "CONTEST" && (
                            <TabsContent value="problems" className="mt-6">
                                {event.canEdit ? (
                                    <ManageEventProblems
                                        eventId={event.id}
                                        currentProblems={event.problems || []}
                                        onRefresh={() => refetch()}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-muted/30 border border-border/50 p-6 rounded-2xl">
                                            <h3 className="text-lg font-black tracking-tight mb-2">Contest Problems</h3>
                                            <p className="text-sm text-muted-foreground">Solve these challenges to earn points and climb the leaderboard.</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {event.problems?.length > 0 ? (
                                                [...event.problems].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((ep: any, index: number) => (
                                                    <Link key={ep.id || ep.problemId} href={`/p/${ep.problem?.slug}`}>
                                                        <div className="p-4 bg-card border border-border/50 rounded-xl hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                                    {ep.order || index + 1}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-sm tracking-tight">{ep.problem?.title}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="text-[10px] h-4 py-0 font-black uppercase opacity-60">{ep.problem?.difficulty}</Badge>
                                                                        <span className="text-[11px] font-black text-brand-primary">{ep.points} Points</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground font-medium">
                                                    No problems added to this contest yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-lg sticky top-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">Registration</h3>
                                {event.entryCipherCost === 0 && (
                                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">FREE</Badge>
                                )}
                            </div>

                            <RegistrationDialog
                                event={event}
                                onSuccess={() => refetch()}
                            />

                            <p className="text-[10px] text-center text-muted-foreground">
                                By registering, you agree to the event terms and conditions.
                            </p>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border/50">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Event Info
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Trophy className="w-3.5 h-3.5" /> Rewards
                                    </span>
                                    <span className="font-medium text-foreground">{event.participationAura} Aura</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" /> Team Size
                                    </span>
                                    <span className="font-medium text-foreground">{event.requiresTeam ? `Max ${event.teamSize}` : "Solo"}</span>
                                </div>
                                {event.externalUrl && (
                                    <Link href={event.externalUrl} target="_blank">
                                        <Button variant="link" className="px-0 h-auto text-primary text-sm flex items-center gap-2">
                                            <ExternalLink className="w-3.5 h-3.5" /> Official Website
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-primary">
                            <Star className="w-4 h-4 fill-primary" />
                            Sponsorship Tip
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Organizing an event? Contact us to feature your event on the global discover board and reach thousands of developers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
