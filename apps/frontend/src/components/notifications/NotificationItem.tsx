"use client";

import { useRouter } from "next/navigation";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/navbar/UserAvatar";
import {
    Bell,
    UserPlus,
    MessageCircle,
    AtSign,
    Trophy,
    BookOpen,
    Briefcase,
    Users,
    Shield,
    ShieldOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATION_CONFIG: Record<
    NotificationType,
    { icon: typeof Bell; color: string; bg: string }
> = {
    SYSTEM: { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" },
    FOLLOW: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
    COMMENT: { icon: MessageCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    MENTION: { icon: AtSign, color: "text-violet-500", bg: "bg-violet-500/10" },
    ACHIEVEMENT_UNLOCKED: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    COURSE_ENROLLMENT: { icon: BookOpen, color: "text-teal-500", bg: "bg-teal-500/10" },
    JOB_APPLICATION_UPDATE: { icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10" },
    COMMUNITY_JOIN_REQUEST: { icon: Users, color: "text-brand-primary", bg: "bg-brand-primary/10" },
    COMMUNITY_MODERATOR_ASSIGNED: { icon: Shield, color: "text-brand-primary", bg: "bg-brand-primary/10" },
    COMMUNITY_MODERATOR_REMOVED: { icon: ShieldOff, color: "text-rose-500", bg: "bg-rose-500/10" },
};

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
}

export default function NotificationItem({
    notification,
    onRead,
}: NotificationItemProps) {
    const router = useRouter();
    const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.SYSTEM;
    const Icon = config.icon;

    const handleClick = () => {
        if (!notification.isRead) {
            onRead(notification.id);
        }
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full flex items-start gap-4 px-5 py-4 text-left transition-colors cursor-pointer border-b border-border/40 last:border-0",
                "hover:bg-muted/50",
                !notification.isRead && "bg-brand-primary/[0.03]"
            )}
        >
            {/* Icon or Avatar */}
            <div className="shrink-0 mt-0.5">
                {notification.actor ? (
                    <div className="relative">
                        <UserAvatar user={notification.actor} size="md" />
                        <div
                            className={cn(
                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-card",
                                config.bg
                            )}
                        >
                            <Icon className={cn("w-3 h-3", config.color)} />
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            config.bg
                        )}
                    >
                        <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {notification.title && (
                    <p className="text-sm font-semibold text-foreground leading-tight mb-0.5">
                        {notification.title}
                    </p>
                )}
                <p
                    className={cn(
                        "text-sm leading-relaxed",
                        notification.isRead ? "text-muted-foreground" : "text-foreground"
                    )}
                >
                    {notification.actor && notification.type !== "SYSTEM" && (
                        <span className="font-semibold">u/{notification.actor.username} </span>
                    )}
                    {notification.message}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 font-medium">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>

            {/* Unread dot */}
            {!notification.isRead && (
                <div className="shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                </div>
            )}
        </button>
    );
}
