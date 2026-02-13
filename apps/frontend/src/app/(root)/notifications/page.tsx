"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    useFetchNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useUnreadCount,
} from "@/hooks/useNotifications";
import { useAppSelector } from "@/store/hooks";
import { Notification } from "@/types/notification";
import { socketInstance } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import {
    Bell,
    CheckCheck,
    Loader2,
    BellOff,
} from "lucide-react";
import NotificationItem from "@/components/notifications/NotificationItem";

export default function NotificationsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useFetchNotifications();

    const { data: unreadCount } = useUnreadCount();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    const notifications = data?.pages.flatMap((page) => page.notifications) || [];

    // Real-time: listen for new notifications via socket
    useEffect(() => {
        const socket = socketInstance.getSocket();
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            queryClient.setQueryData(["notifications"], (old: any) => {
                if (!old?.pages?.[0]) return old;
                return {
                    ...old,
                    pages: [
                        {
                            ...old.pages[0],
                            notifications: [notification, ...old.pages[0].notifications],
                        },
                        ...old.pages.slice(1),
                    ],
                };
            });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        };

        socket.on("notification:new", handleNewNotification);
        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [queryClient]);

    // Redirect to login if not authenticated
    if (!user) {
        return (
            <div className="py-20 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-lg">Please log in to view notifications</p>
            </div>
        );
    }

    return (
        <div className="py-4 lg:py-8 space-y-6 lg:pr-70 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
                    {unreadCount !== undefined && unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            You have{" "}
                            <span className="font-semibold text-brand-primary">{unreadCount}</span>{" "}
                            unread notification{unreadCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                {notifications.some((n) => !n.isRead) && (
                    <button
                        onClick={() => markAllAsRead.mutate()}
                        disabled={markAllAsRead.isPending}
                        className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {markAllAsRead.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <CheckCheck className="w-3.5 h-3.5" />
                        )}
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="divide-y divide-border/40">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-3.5 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={(id) => markAsRead.mutate(id)}
                            />
                        ))}

                        {/* Load More */}
                        {hasNextPage && (
                            <div className="p-4 border-t border-border bg-muted/10 text-center">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="text-xs font-black text-brand-primary hover:underline flex items-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                                >
                                    {isFetchingNextPage ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        "Load More"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-6 py-16 text-center text-muted-foreground">
                        <BellOff className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-semibold text-lg">All caught up!</p>
                        <p className="text-sm mt-1">You have no notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
