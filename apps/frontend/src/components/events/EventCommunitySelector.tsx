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
import { ChevronDown, Users, Search, ShieldCheck } from "lucide-react";

import { useFormContext } from "react-hook-form";
import { useJoinedCommunities } from "@/hooks/useCommunities";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EventCommunitySelectorProps {
    value?: string;
    onChange?: (value: string) => void;
}

export default function EventCommunitySelector({ value, onChange }: EventCommunitySelectorProps) {
    const { user } = useAppSelector((state) => state.auth);
    const context = useFormContext();

    const communityId = value !== undefined ? value : context?.watch("communityId");

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useJoinedCommunities(user?.id, 10, debouncedSearch, true);

    const communities = data?.pages.flatMap((page) => page.communities) || [];

    const selectedCommunity = communities.find((c: any) => c.id === communityId);

    const handleSelect = (id: string) => {
        if (onChange) {
            onChange(id);
        } else if (context) {
            context.setValue("communityId", id, { shouldValidate: true, shouldDirty: true });
        }
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border/50 hover:border-brand-primary/50 hover:bg-muted/30 transition-all duration-200 shadow-sm outline-none group cursor-pointer w-full max-w-md">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className="relative shrink-0">
                            <UserAvatar
                                user={{
                                    username: selectedCommunity?.name || "Select Community",
                                    avatarUrl: selectedCommunity?.iconUrl || undefined
                                }}
                                size="md"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-primary border-2 border-background flex items-center justify-center">
                                <ShieldCheck className="h-2.5 w-2.5 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col items-start leading-none gap-1 overflow-hidden">
                            <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">Hosting Community</span>
                            <span className="font-bold text-sm text-foreground/90 truncate w-full">
                                {selectedCommunity ? `d/${selectedCommunity.name}` : "Select a community"}
                            </span>
                        </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[300px] p-2 rounded-xl border-border/50 shadow-xl backdrop-blur-md bg-card/95">
                <DropdownMenuLabel className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Moderated Communities
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border/40 mx-1" />

                <div className="px-2 py-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground z-10" />
                        <Input
                            placeholder="Search your communities..."
                            className="h-9 pl-9 text-xs bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-brand-primary shadow-none placeholder:text-muted-foreground/60 transition-all cursor-text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-1 p-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">You don't moderate any communities yet.</p>
                        </div>
                    ) : (
                        communities.map((community: any) => (
                            <DropdownMenuItem
                                key={community.id}
                                className={`gap-3 p-2.5 cursor-pointer rounded-lg hover:bg-brand-primary/10 focus:bg-brand-primary/10 group transition-all duration-200 border border-transparent ${communityId === community.id ? "bg-brand-primary/5 border-brand-primary/20" : ""}`}
                                onClick={() => handleSelect(community.id)}
                            >
                                <div className="relative">
                                    <UserAvatar
                                        user={{ username: community.name, avatarUrl: community.iconUrl }}
                                        size="md"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-primary border-2 border-background flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <span className="font-bold text-sm text-foreground transition-colors truncate">d/{community.name}</span>
                                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5 font-medium">{community.memberCount} members</span>
                                </div>
                                {communityId === community.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(88,101,242,0.5)]" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
