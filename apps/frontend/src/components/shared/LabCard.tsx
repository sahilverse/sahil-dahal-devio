"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LabRoom } from "@/api/labService";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    Users,
    Clock,
    Zap,
    ArrowUpRight,
    Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LabCardProps {
    room: LabRoom;
    className?: string;
}

const difficultyConfig = {
    EASY: {
        label: "Easy",
        className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        gradient: "from-emerald-500/20 to-emerald-500/5",
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        gradient: "from-amber-500/20 to-amber-500/5",
    },
    HARD: {
        label: "Hard",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        gradient: "from-red-500/20 to-red-500/5",
    },
};

export const LabCard: React.FC<LabCardProps> = ({ room, className }) => {
    const difficulty = difficultyConfig[room.difficulty];

    return (
        <Link
            href={`/labs/${room.slug}`}
            className={cn(
                "group relative block bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:border-brand-primary/50 hover:shadow-[0_8px_30px_rgba(88,101,242,0.12)] dark:hover:shadow-[0_8px_30px_rgba(88,101,242,0.08)]",
                className
            )}
        >
            {/* Room Image / Gradient Header */}
            <div className={cn("relative h-36 w-full bg-gradient-to-br", difficulty.gradient)}>
                {room.imageUrl ? (
                    <Image
                        src={room.imageUrl}
                        alt={room.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="h-16 w-16 text-foreground/10" />
                    </div>
                )}
                {/* Difficulty Badge Overlay */}
                <div className="absolute top-3 left-3">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] uppercase font-black px-2.5 py-1 backdrop-blur-md bg-card/60 border",
                            difficulty.className
                        )}
                    >
                        {difficulty.label}
                    </Badge>
                </div>
                {/* Points Reward */}
                {room.pointsReward > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-brand-primary/80 text-white text-[10px] font-black px-2.5 py-1 backdrop-blur-md border-none">
                            <Zap className="h-3 w-3 mr-1" />
                            {room.pointsReward} pts
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
                        {room.title}
                    </h3>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-2" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {room.description}
                </p>

                {/* Footer Stats */}
                <div className="flex items-center justify-between border-t border-border/30 pt-3 text-[11px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Flag className="h-3.5 w-3.5" />
                            {room._count?.challenges ?? 0} challenges
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {room._count?.enrollments ?? 0} enrolled
                        </div>
                    </div>
                    {room.estimatedTime && (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                            ~{room.estimatedTime} min
                        </div>
                    )}
                </div>
            </div>

            {/* Hover border trace */}
            <div className="absolute inset-0 rounded-2xl border border-brand-primary/0 transition-all duration-700 group-hover:border-brand-primary/20 pointer-events-none" />
        </Link>
    );
};
