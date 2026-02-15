"use client";

import { Community } from "@/types/community";
import { format } from "date-fns";
import { Calendar, Globe, Lock, ShieldCheck, Settings, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommunityRules from "./CommunityRules";
import ModeratorList from "./ModeratorList";
import CommunitySettingsModal from "./CommunitySettingsModal";
import CommunityRulesEditor from "./CommunityRulesEditor";
import JoinRequestList from "./JoinRequestList";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { openChat, setPendingRecipient } from "@/slices/chat/chatSlice";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useCommunityModerators } from "@/hooks/useCommunity";

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

    return (
        <div className="flex flex-col gap-0 w-full border border-card rounded-lg dark:border-secondary border-gray-700/20 overflow-hidden">
            {/* Community Info Section */}
            <div className="p-4 space-y-3">
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
        </div>
    );
}
