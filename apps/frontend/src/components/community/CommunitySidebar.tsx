"use client";

import { Community } from "@/types/community";
import { format } from "date-fns";
import { Calendar, Globe, Lock, ShieldCheck, Settings, FileText, MessageCircle, MoreHorizontal, Check, Share2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommunityRules from "./CommunityRules";
import ModeratorList from "./ModeratorList";
import CommunitySettingsModal from "./CommunitySettingsModal";
import CommunityRulesEditor from "./CommunityRulesEditor";
import JoinRequestList from "./JoinRequestList";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { openChat, setPendingRecipient } from "@/slices/chat/chatSlice";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCommunityModerators, useLeaveCommunity } from "@/hooks/useCommunity";
import { copyCurrentUrl } from "@/lib/string";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ui/modals/ConfirmDeleteModal";

const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
};

const visibilityIcon = (v: string) => {
    switch (v) {
        case "PUBLIC": return <Globe className="w-3.5 h-3.5" />;
        case "PRIVATE": return <Lock className="w-3.5 h-3.5" />;
        case "RESTRICTED": return <ShieldCheck className="w-3.5 h-3.5" />;
        default: return <Globe className="w-3.5 h-3.5" />;
    }
};

interface CommunitySidebarProps {
    community: Community;
}

export default function CommunitySidebar({ community }: CommunitySidebarProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const dispatch = useAppDispatch();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRulesEditorOpen, setIsRulesEditorOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    const leaveMutation = useLeaveCommunity(community.name);

    const isMod = !!community.isMod;
    const isMember = !!community.isMember;

    const { data: modData } = useCommunityModerators(community.name, 3);
    const firstMod = modData?.pages?.[0]?.moderators?.[0];

    const handleMessageMods = () => {
        if (!user) { openLogin(); return; }
        if (firstMod) {
            dispatch(setPendingRecipient({
                id: firstMod.userId,
                username: firstMod.username,
                avatarUrl: firstMod.avatarUrl ?? null,
            }));
            dispatch(openChat());
        }
    };

    const handleShare = async () => {
        await copyCurrentUrl();
        toast.success("Link copied to clipboard");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleLeave = () => {
        setIsLeaveDialogOpen(true);
    };

    const confirmLeave = () => {
        leaveMutation.mutate(undefined, {
            onSuccess: () => setIsLeaveDialogOpen(false)
        });
    };

    return (
        <div className="flex flex-col gap-0 w-full border border-card rounded-lg dark:border-secondary border-gray-700/20 overflow-hidden">
            {/* Community Identity & Info Section */}
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tighter cursor-default">d/{community.name}</h2>
                    {!isMember ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={handleShare}
                        >
                            {hasCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                        </Button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card w-40">
                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleShare}>
                                    {hasCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                                    {hasCopied ? "Copied!" : "Share"}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                    onClick={handleLeave}
                                    disabled={leaveMutation.isPending}
                                >
                                    <LogOut className="h-4 w-4" /> Leave
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Description */}
                {/* Description */}
                {community.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        {community.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created {format(new Date(community.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {visibilityIcon(community.visibility)}
                        <span>{community.visibility.charAt(0) + community.visibility.slice(1).toLowerCase()}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                    <div className="text-center">
                        <p className="text-lg font-bold">{formatCount(community.weeklyVisitors || 0)}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">Weekly visitors</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold">{formatCount(community.activeMembers || 0)}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">Active members</p>
                    </div>
                </div>

                {/* Message Mods button (for non-mod members only) */}
                {isMember && !isMod && firstMod && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full font-semibold cursor-pointer text-xs"
                        onClick={handleMessageMods}
                    >
                        <MessageCircle className="w-3.5 h-3.5" /> Message Mods
                    </Button>
                )}

                {/* Mod Action Buttons */}
                {isMod && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full font-semibold cursor-pointer text-xs"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="w-3.5 h-3.5" /> Community Settings
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full font-semibold cursor-pointer text-xs"
                            onClick={() => setIsRulesEditorOpen(true)}
                        >
                            <FileText className="w-3.5 h-3.5" /> Edit Rules
                        </Button>
                        {community.visibility === "PRIVATE" && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full font-semibold cursor-pointer text-xs"
                                onClick={() => setIsRequestsOpen(true)}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" /> Join Requests
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Rules Section */}
            <CommunityRules communityName={community.name} />

            {/* Moderators Section */}
            <ModeratorList communityName={community.name} isMod={isMod} />

            {/* Modals */}
            <CommunitySettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                communityName={community.name}
            />

            <CommunityRulesEditor
                isOpen={isRulesEditorOpen}
                onClose={() => setIsRulesEditorOpen(false)}
                communityName={community.name}
            />

            {community.visibility === "PRIVATE" && (
                <JoinRequestList
                    isOpen={isRequestsOpen}
                    onClose={() => setIsRequestsOpen(false)}
                    communityName={community.name}
                />
            )}

            <ConfirmDeleteModal
                isOpen={isLeaveDialogOpen}
                onClose={() => setIsLeaveDialogOpen(false)}
                onConfirm={confirmLeave}
                title="Leave Community?"
                description={`Are you sure you want to leave d/${community.name}? You will lose access to member-only features.`}
                isPending={leaveMutation.isPending}
            />
        </div>
    );
}
