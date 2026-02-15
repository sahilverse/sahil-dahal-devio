"use client";

import { Community } from "@/types/community";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJoinCommunityPage } from "@/hooks/useCommunity";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Loader2, Clock } from "lucide-react";

interface AccessDeniedProps {
    community: Community;
}

export default function AccessDenied({ community }: AccessDeniedProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const joinMutation = useJoinCommunityPage(community.name);

    const handleRequestJoin = () => {
        if (!user) { openLogin(); return; }
        joinMutation.mutate(undefined);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4 shadow-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold">d/{community.name}</h2>
                    <p className="text-muted-foreground text-sm">
                        This is a private community. You must be a member to view its content.
                    </p>
                </div>

                {community.description && (
                    <p className="text-sm text-foreground/70 border-t border-border/50 pt-4">
                        {community.description}
                    </p>
                )}

                <Button
                    variant="brand"
                    size="lg"
                    className="w-full font-semibold cursor-pointer"
                    onClick={handleRequestJoin}
                    disabled={joinMutation.isPending}
                >
                    {joinMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <><Clock className="w-4 h-4" /> Request to Join</>
                    )}
                </Button>
            </div>
        </div>
    );
}
