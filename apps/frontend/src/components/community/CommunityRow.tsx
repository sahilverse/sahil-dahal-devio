"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useJoinCommunity } from "@/hooks/useCommunities";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppSelector } from "@/store/hooks";

interface CommunityRowProps {
    community: {
        id: string;
        name: string;
        description: string;
        iconUrl?: string;
        weeklyVisitors?: number;
        _count: {
            members: number;
        };
    };
    className?: string;
}

const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
};

export function CommunityRow({ community, className }: CommunityRowProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const joinMutation = useJoinCommunity();

    const handleJoin = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLogin();
            return;
        }

        joinMutation.mutate(community.name);
    };

    return (
        <div className={cn("group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card/10 hover:bg-card/80 hover:border-brand/30 hover:shadow-sm transition-all duration-300 cursor-pointer", className)}>
            <div className="flex items-center gap-3">
                <Link href={`/d/${community.name}`} className="shrink-0">
                    <Avatar className="size-12 rounded-full border border-border/80 shadow-sm">
                        <AvatarImage src={community.iconUrl} className="object-cover" />
                        <AvatarFallback className="bg-brand/10 text-brand font-bold text-sm">
                            d/
                        </AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                            <Link href={`/d/${community.name}`} className="font-bold text-[15px] hover:underline truncate leading-none mb-1 text-foreground/90">
                                {community.name}
                            </Link>
                            <span className="text-[12px] text-muted-foreground/80 font-semibold flex items-center gap-1.5 px-0.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                {formatCount(community.weeklyVisitors || 0)} weekly visitors
                            </span>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 px-6 rounded-full font-bold bg-[#e5ebee] hover:bg-[#e5ebee]/80 dark:hover:bg-[#2a3236]/80 dark:bg-[#2a3236] text-black dark:text-slate-50 text-sm shrink-0 shadow-sm border-none transition-colors"
                            onClick={handleJoin}
                            disabled={joinMutation.isPending}
                        >
                            {joinMutation.isPending ? "..." : "Join"}
                        </Button>
                    </div>
                </div>
            </div>

            <p className="text-[12px] text-foreground/70 dark:text-foreground/60 line-clamp-2 leading-relaxed h-10 px-0.5 font-medium">
                {community.description || "A classic community for discovery and sharing great content."}
            </p>
        </div>
    );
}
