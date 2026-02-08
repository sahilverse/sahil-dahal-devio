"use client";

import { useAppSelector } from "@/store/hooks";
import UserAvatar from "@/components/navbar/UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Users, User as UserIcon, Search } from "lucide-react";

import { useFormContext } from "react-hook-form";
import { useJoinedCommunities } from "@/hooks/useCommunities";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function PostContextSelector() {
    const { user } = useAppSelector((state) => state.auth);
    const { setValue, watch } = useFormContext();
    const communityId = watch("communityId");

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data } = useJoinedCommunities(user?.id, 5, debouncedSearch);
    const communities = data?.pages.flatMap((page) => page.communities) || [];

    const selectedCommunity = communities.find((c: any) => c.id === communityId);
    const isProfileSelected = !communityId;

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 px-3.5 py-2 rounded-3xl bg-card border border-border/50 hover:bg-muted/50 transition-all duration-200 shadow-sm outline-none group w-fit cursor-pointer">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <UserAvatar
                            user={{
                                username: isProfileSelected ? user.username : selectedCommunity?.name || "",
                                avatarUrl: isProfileSelected ? user.avatarUrl || undefined : selectedCommunity?.iconUrl || undefined
                            }}
                            size="sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 transition-colors">Posting to</span>
                        <span className="font-bold text-sm text-foreground/90">
                            {isProfileSelected ? `u/${user.username}` : `d/${selectedCommunity?.name}`}
                        </span>
                    </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground/40 transition-colors ml-1" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[280px] p-2 rounded-xl border-border/50 shadow-xl backdrop-blur-sm bg-card">
                <DropdownMenuLabel className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 flex items-center gap-2">
                    <UserIcon className="w-3 h-3" /> Select Destination
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border/40 mx-1" />

                <DropdownMenuItem
                    className="gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-muted focus:bg-muted group transition-colors"
                    onClick={() => setValue("communityId", undefined)}
                >
                    <UserAvatar user={user} size="md" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground transition-colors">u/{user.username}</span>
                        <span className="text-xs text-muted-foreground">Your Profile</span>
                    </div>
                    {isProfileSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                </DropdownMenuItem>

                <div className="mt-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 flex items-center gap-2 border-t border-border/30">
                    <Users className="w-3 h-3" /> Communities
                </div>

                <div className="px-2 pb-2">
                    <div className="relative bg-card">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground z-10" />
                        <Input
                            placeholder="Search communities"
                            className="h-8 pl-8 text-xs bg-muted/50 border-input/50 focus-visible:ring-1 shadow-none bg-card placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    {communities.map((community: any) => (
                        <DropdownMenuItem
                            key={community.id}
                            className="gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-muted focus:bg-muted group transition-colors"
                            onClick={() => setValue("communityId", community.id)}
                        >
                            <UserAvatar
                                user={{ username: community.name, avatarUrl: community.iconUrl }}
                                size="md"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-foreground transition-colors">d/{community.name}</span>
                                <span className="text-xs text-muted-foreground">{community.memberCount} members</span>
                            </div>
                            {communityId === community.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                        </DropdownMenuItem>
                    ))}
                </div>

                <DropdownMenuItem className="gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-muted focus:bg-muted group mt-0.5 opacity-60 hover:opacity-100 transition-all">
                    <div className="h-9 w-9 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center transition-colors">
                        <Plus className="h-5 w-5 text-muted-foreground/50 transition-colors" />
                    </div>
                    <span className="font-bold text-sm transition-colors">Create / Join Community</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
