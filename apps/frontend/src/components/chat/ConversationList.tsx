"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveConversation } from "@/slices/chat/chatSlice";
import UserAvatar from "../navbar/UserAvatar";
import { useConversations, useDeleteConversation } from "@/hooks/useConversation";
import { Trash2, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Conversation } from "@/types/conversation";

import { formatDistanceToNowStrict, format, differenceInSeconds } from "date-fns";
import { enUS } from "date-fns/locale";

function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = differenceInSeconds(now, date);

    if (diffInSeconds < 60) return "Now";

    if (diffInSeconds < 60 * 60 * 24 * 7) {
        const distance = formatDistanceToNowStrict(date, {
            addSuffix: false,
            locale: {
                ...enUS,
                formatDistance: (token, count, options) => {
                    const formatDistanceLocale: Record<string, string> = {
                        xSeconds: "Now",
                        xMinutes: `${count}m`,
                        xHours: `${count}h`,
                        xDays: `${count}d`,
                    };
                    return formatDistanceLocale[token] ?? "";
                },
            },
        });
        return distance;
    }

    return format(date, "MMM d");
}

export default function ConversationList({ filter = "all" }: { filter?: "all" | "requests" }) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((s) => s.auth);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useConversations();
    const { mutate: deleteConversation } = useDeleteConversation();

    const allConversations: Conversation[] = data?.pages?.flat() ?? [];

    const conversations = allConversations.filter(conv => {
        const isInvite = conv.status === "INVITE_PENDING" && conv.inviteSenderId !== user?.id;
        if (filter === "requests") return isInvite;
        return !isInvite;
    });

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (
            target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center text-muted-foreground mt-8">
                {filter === "requests" ? (
                    <>
                        <p className="text-sm font-semibold mb-1">No requests</p>
                        <p className="text-xs">You have no pending message requests.</p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">💬</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">Welcome to chat!</p>
                        <p className="text-xs">Start a direct or group chat with other users.</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            {conversations.map((conv) => {
                const lastMessage = conv.messages?.[0];
                const isInvite = conv.status === "INVITE_PENDING" && conv.inviteSenderId !== user?.id;

                const me = conv.participants.find(p => p.userId === user?.id);
                const lastReadAt = me?.lastReadAt ? new Date(me.lastReadAt) : new Date(0);
                const hasUnread = !!lastMessage && lastMessage.senderId !== user?.id && new Date(lastMessage.createdAt) > lastReadAt;

                return (
                    <div
                        key={conv.id}
                        className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer relative"
                        onClick={() => dispatch(setActiveConversation(conv.id))}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <UserAvatar
                                user={{
                                    avatarUrl: conv.iconUrl,
                                    username: conv.name || "Chat"
                                }}
                                size="md"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm truncate ${hasUnread ? "font-bold text-foreground" : "font-semibold"}`}>
                                    {conv.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                    {conv.updatedAt ? formatTimestamp(conv.updatedAt) : ""}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs truncate ${hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                    {isInvite ? (
                                        <span className="text-brand-primary font-medium">Invitation</span>
                                    ) : lastMessage ? (
                                        <>
                                            {lastMessage.senderId === user?.id && (
                                                <span className="text-muted-foreground">You: </span>
                                            )}
                                            {lastMessage.isDeleted
                                                ? "This message was removed"
                                                : lastMessage.content || "📎 Media"}
                                        </>
                                    ) : (
                                        "Start chatting"
                                    )}
                                </p>
                                {hasUnread && (
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0 mb-2" />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bottom-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-card">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }}
                                        className="cursor-pointer text-xs text-destructive"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                        Delete chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            })}

            {isFetchingNextPage && (
                <div className="flex justify-center py-3">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
