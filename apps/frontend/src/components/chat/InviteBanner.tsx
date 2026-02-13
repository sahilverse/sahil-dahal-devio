"use client";

import { Button } from "@/components/ui/button";
import { useAcceptInvite, useDeclineInvite } from "@/hooks/useConversation";
import { toast } from "sonner";

interface InviteBannerProps {
    conversationId: string;
    senderName: string;
    onAccepted?: () => void;
}

export default function InviteBanner({ conversationId, senderName, onAccepted }: InviteBannerProps) {
    const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();
    const { mutate: declineInvite, isPending: isDeclining } = useDeclineInvite();
    const isPending = isAccepting || isDeclining;

    const handleAccept = () => {
        acceptInvite(conversationId, {
            onSuccess: () => {
                toast.success("Invite accepted!");
                onAccepted?.();
            },
            onError: () => toast.error("Failed to accept invite"),
        });
    };

    const handleDecline = () => {
        declineInvite(conversationId, {
            onSuccess: () => toast.success("Invite declined"),
            onError: () => toast.error("Failed to decline invite"),
        });
    };

    return (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
            <p className="text-xs text-center text-muted-foreground mb-2.5">
                <span className="font-semibold text-foreground">{senderName}</span> wants to chat with you
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="brand"
                    size="sm"
                    className="flex-1 h-8 text-xs font-semibold cursor-pointer"
                    onClick={handleAccept}
                    disabled={isPending}
                >
                    Accept
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-8 text-xs font-semibold cursor-pointer"
                    onClick={handleDecline}
                    disabled={isPending}
                >
                    Decline
                </Button>
            </div>
        </div>
    );
}
