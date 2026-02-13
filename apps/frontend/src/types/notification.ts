export type NotificationType =
    | "SYSTEM"
    | "FOLLOW"
    | "COMMENT"
    | "MENTION"
    | "ACHIEVEMENT_UNLOCKED"
    | "COURSE_ENROLLMENT"
    | "JOB_APPLICATION_UPDATE"
    | "COMMUNITY_JOIN_REQUEST"
    | "COMMUNITY_MODERATOR_ASSIGNED"
    | "COMMUNITY_MODERATOR_REMOVED";

export interface NotificationActor {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string | null;
    message: string;
    actionUrl: string | null;
    data: any;
    isRead: boolean;
    createdAt: string;
    actor: NotificationActor | null;
}

export interface PaginatedNotifications {
    notifications: Notification[];
    nextCursor: string | null;
}
