"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Users, Trophy, ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
    event: any;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const isOngoing = event.status === "ONGOING";
    const isUpcoming = event.status === "PUBLISHED" && new Date(event.startsAt) > new Date();
    const isCompleted = event.status === "COMPLETED";

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="relative aspect-[21/9] overflow-hidden">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge variant={isOngoing ? "default" : isUpcoming ? "secondary" : "outline"} className="capitalize shadow-sm cursor-pointer hover:ring-1 hover:ring-brand-primary/50 transition-all">
                        {event.status.toLowerCase().replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-background transition-all">
                        {event.type}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {event.community && (
                        <Link href={`/d/${event.community.name}`} className="hover:text-primary flex items-center gap-1 transition-colors">
                            {event.community.iconUrl && (
                                <Image src={event.community.iconUrl} alt={event.community.name} width={16} height={16} className="rounded-full" />
                            )}
                            <span className="font-medium">d/{event.community.name}</span>
                        </Link>
                    )}
                    <span>•</span>
                    <span>{format(new Date(event.startsAt), "MMM d, yyyy")}</span>
                </div>
                <Link href={`/events/${event.slug || event.id}`}>
                    <h3 className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors leading-tight">
                        {event.title}
                    </h3>
                </Link>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">
                    {event.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>
                            <span className="font-semibold text-foreground">{event.participantCount || 0}</span> joined
                        </span>
                    </div>
                    {event.entryCipherCost > 0 ? (
                        <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
                            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                            <span>
                                <span className="font-semibold text-foreground">{event.entryCipherCost}</span> Cipher
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-md">
                            <Trophy className="w-3.5 h-3.5 text-green-500" />
                            <span className="font-semibold text-foreground">Free Entry</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {(() => {
                    const isParticipant = event.userParticipation !== undefined;
                    let href = `/events/${event.slug || event.id}`;
                    let label = "Learn More";

                    if (isOngoing) {
                        label = "View Live";
                        href += isParticipant ? "?tab=problems" : "?tab=about";
                    } else if (isCompleted) {
                        label = "View Results";
                        href += "?tab=leaderboard";
                    }

                    return (
                        <Link href={href} className="w-full">
                            <Button variant={isOngoing ? "default" : "outline"} className="w-full font-semibold">
                                {label}
                            </Button>
                        </Link>
                    );
                })()}
            </CardFooter>
        </Card>
    );
};
