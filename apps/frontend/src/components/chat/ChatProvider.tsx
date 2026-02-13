"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketInstance } from "@/lib/socket";
import { useAppSelector } from "@/store/hooks";
import type { Message } from "@/types/conversation";

export default function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAppSelector((s) => s.auth);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const socket = socketInstance.getSocket();
        if (!socket) return;

        // New conversation created
        const handleNewConversation = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        };

        // New message received
        const handleNewMessage = (message: Message) => {
            queryClient.setQueryData(
                ["messages", message.conversationId],
                (old: any) => {
                    if (!old?.pages) return old;
                    const updatedPages = [...old.pages];
                    updatedPages[updatedPages.length - 1] = [
                        ...updatedPages[updatedPages.length - 1],
                        message,
                    ];
                    return { ...old, pages: updatedPages };
                }
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        };

        // Message updated (edited or unsent)
        const handleMessageUpdated = (message: Message) => {
            queryClient.setQueryData(
                ["messages", message.conversationId],
                (old: any) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: Message[]) =>
                            page.map((msg) => (msg.id === message.id ? message : msg))
                        ),
                    };
                }
            );
        };

        // Message deleted
        const handleMessageDeleted = ({ type }: { type: string }) => {
            if (type === "me") {
                queryClient.invalidateQueries({ queryKey: ["messages"] });
            }
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        };

        // Invite accepted
        const handleInviteAccepted = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        // Invite declined
        const handleInviteDeclined = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        // Conversation seen
        const handleConversationSeen = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        };

        // Conversation cleared/deleted
        const handleConversationCleared = ({ conversationId }: { conversationId: string }) => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.removeQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
        };

        // Register listeners
        socket.on("conversation:new", handleNewConversation);
        socket.on("message:new", handleNewMessage);
        socket.on("message:updated", handleMessageUpdated);
        socket.on("message:deleted", handleMessageDeleted);
        socket.on("invite:accepted", handleInviteAccepted);
        socket.on("invite:declined", handleInviteDeclined);
        socket.on("conversation:seen", handleConversationSeen);
        socket.on("conversation:cleared", handleConversationCleared);

        return () => {
            socket.off("conversation:new", handleNewConversation);
            socket.off("message:new", handleNewMessage);
            socket.off("message:updated", handleMessageUpdated);
            socket.off("message:deleted", handleMessageDeleted);
            socket.off("invite:accepted", handleInviteAccepted);
            socket.off("invite:declined", handleInviteDeclined);
            socket.off("conversation:seen", handleConversationSeen);
            socket.off("conversation:cleared", handleConversationCleared);
        };
    }, [user, queryClient]);

    return <>{children}</>;
}
