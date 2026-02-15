"use client";

import { useJoinRequests, useReviewJoinRequest } from "@/hooks/useCommunity";
import { JoinRequest } from "@/types/community";
import UserAvatar from "@/components/navbar/UserAvatar";
import { X, Loader2, Check, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface JoinRequestListProps {
    isOpen: boolean;
    onClose: () => void;
    communityName: string;
}

export default function JoinRequestList({
    isOpen,
    onClose,
    communityName,
}: JoinRequestListProps) {
    const { data: requests, isLoading } = useJoinRequests(communityName, isOpen);
    const reviewMutation = useReviewJoinRequest(communityName);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleReview = (requestId: string, status: "APPROVED" | "REJECTED") => {
        reviewMutation.mutate({ requestId, status });
    };

    if (!isOpen) return null;

    const pendingRequests = Array.isArray(requests)
        ? (requests as JoinRequest[]).filter((r) => r.status === "PENDING")
        : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card text-card-foreground border rounded-xl shadow-xl max-w-md w-full p-6 overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Join Requests</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">No pending requests</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                            >
                                <Link
                                    href={`/u/${request.user.username}`}
                                    className="flex items-center gap-3 min-w-0"
                                >
                                    <UserAvatar
                                        user={{ username: request.user.username, avatarUrl: request.user.avatarUrl }}
                                        size="sm"
                                    />
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-foreground truncate block">
                                            u/{request.user.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 cursor-pointer"
                                        onClick={() => handleReview(request.id, "APPROVED")}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 cursor-pointer"
                                        onClick={() => handleReview(request.id, "REJECTED")}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
