"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketInstance } from "@/lib/socket";
import { useAppSelector } from "@/store/hooks";

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAppSelector((s) => s.auth);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const socket = socketInstance.getSocket();
        if (!socket) return;

        const handleNewNotification = () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        };

        const handleNewChatActivity = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        socket.on("notification:new", handleNewNotification);
        socket.on("message:new", handleNewChatActivity);
        socket.on("conversation:new", handleNewChatActivity);
        socket.on("invite:accepted", handleNewChatActivity);
        socket.on("invite:declined", handleNewChatActivity);

        return () => {
            socket.off("notification:new", handleNewNotification);
            socket.off("message:new", handleNewChatActivity);
            socket.off("conversation:new", handleNewChatActivity);
            socket.off("invite:accepted", handleNewChatActivity);
            socket.off("invite:declined", handleNewChatActivity);
        };
    }, [user, queryClient]);

    return <>{children}</>;
}
