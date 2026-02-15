"use client";

import { useCommunityModerators, useUpdateModeratorPermissions } from "@/hooks/useCommunity";
import { CommunityMember } from "@/types/community";
import UserAvatar from "@/components/navbar/UserAvatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Crown, Shield, UserMinus, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";
import { cn } from "@/lib/utils";
import ModeratorPermissionsModal from "./ModeratorPermissionsModal";

interface ModeratorListProps {
    communityName: string;
    isMod?: boolean;
}

export default function ModeratorList({ communityName, isMod = false }: ModeratorListProps) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useCommunityModerators(communityName, 3);
    const updatePermissions = useUpdateModeratorPermissions(communityName);

    const [isExpanded, setIsExpanded] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<CommunityMember | null>(null);

    const moderators: CommunityMember[] =
        data?.pages.flatMap((page) => page.moderators) || [];

    const displayedMods = isExpanded ? moderators : moderators.slice(0, 3);

    const handleRemoveMod = () => {
        if (!removingUserId) return;
        updatePermissions.mutate(
            { userId: removingUserId, isMod: false },
            { onSuccess: () => setRemovingUserId(null) }
        );
    };

    if (moderators.length === 0) return null;

    return (
        <div className="border-t border-border/50">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-4 pt-4 pb-2">
                Moderators
            </h3>
            <div className="px-4 pb-4 space-y-2">
                {displayedMods.map((mod, idx) => (
                    <div
                        key={mod.id}
                        className="flex items-center justify-between group"
                    >
                        <Link
                            href={`/u/${mod.username}`}
                            className="flex items-center gap-2 min-w-0 hover:underline"
                        >
                            <UserAvatar
                                user={{ username: mod.username, avatarUrl: mod.avatarUrl }}
                                size="sm"
                            />
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">
                                    u/{mod.username}
                                </span>
                                {idx === 0 && (
                                    <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                                )}
                            </div>
                        </Link>

                        {isMod && idx !== 0 && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => setItemToEdit(mod)}
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                                    onClick={() => setRemovingUserId(mod.userId)}
                                >
                                    <UserMinus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                {/* View More */}
                {(hasNextPage || moderators.length > 3) && !isExpanded && (
                    <button
                        onClick={() => {
                            setIsExpanded(true);
                            if (hasNextPage) fetchNextPage();
                        }}
                        className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1 pt-1"
                    >
                        <ChevronDown className="h-3 w-3" /> View All Moderators
                    </button>
                )}

                {isExpanded && hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1 pt-1"
                    >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                )}

                {isExpanded && !hasNextPage && moderators.length > 3 && (
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 pt-1"
                    >
                        <ChevronDown className="h-3 w-3 rotate-180" /> Show Less
                    </button>
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={!!removingUserId}
                onClose={() => setRemovingUserId(null)}
                onConfirm={handleRemoveMod}
                title="Remove Moderator"
                description="Are you sure you want to remove this user as a moderator? They will still remain a member of the community."
                isPending={updatePermissions.isPending}
            />

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
                    currentPermissions={itemToEdit.permissions}
                />
            )}
        </div>
    );
}
