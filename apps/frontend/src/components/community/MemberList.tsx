"use client";

import { useCommunityMembers, useUpdateModeratorPermissions } from "@/hooks/useCommunity";
import { CommunityMember } from "@/types/community";
import UserAvatar from "@/components/navbar/UserAvatar";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Loader2, Search, Shield, Crown, UserPlus } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import ModeratorPermissionsModal from "./ModeratorPermissionsModal";

interface MemberListProps {
    communityName: string;
    isMod?: boolean;
}

export default function MemberList({ communityName, isMod = false }: MemberListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [itemToEdit, setItemToEdit] = useState<CommunityMember | null>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        isError,
    } = useCommunityMembers(communityName, 20, debouncedQuery || undefined);

    const updatePermissions = useUpdateModeratorPermissions(communityName);
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-8 text-destructive">
                Failed to load members. Please try again.
            </div>
        );
    }

    const members: CommunityMember[] =
        data?.pages.flatMap((page) => page.members) || [];

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {(isFetching || isLoading) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Member List */}
            {members.length === 0 ? (
                <div className="p-12 border rounded-xl bg-card border-dashed text-center">
                    <p className="text-muted-foreground">
                        {debouncedQuery
                            ? "No members match your search"
                            : "No members yet"}
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
                    {members.map((member, idx) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
                        >
                            <Link
                                href={`/u/${member.username}`}
                                className="flex items-center gap-3 min-w-0"
                            >
                                <UserAvatar
                                    user={{ username: member.username, avatarUrl: member.avatarUrl }}
                                    size="md"
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-foreground truncate">
                                            u/{member.username}
                                        </span>
                                        {member.isMod && (
                                            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </Link>

                            {/* Mod actions */}
                            {isMod && !member.isMod && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                                    onClick={() => setItemToEdit(member)}
                                >
                                    <UserPlus className="h-3.5 w-3.5" /> Make Mod
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
            </div>

            {itemToEdit && (
                <ModeratorPermissionsModal
                    isOpen={!!itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    communityName={communityName}
                    user={{
                        id: itemToEdit.userId,
                        username: itemToEdit.username,
                        avatarUrl: itemToEdit.avatarUrl,
                    }}
                    isInvite={true}
                />
            )}
        </div>
    );
}
