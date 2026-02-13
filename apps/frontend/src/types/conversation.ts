export type ConversationStatus = "ACCEPTED" | "INVITE_PENDING" | "DECLINED";
export type ConversationType = "DIRECT" | "GROUP";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "LINK";
export type MessageStatus = "SENT" | "DELIVERED" | "SEEN";
export type MediaType = "IMAGE" | "VIDEO" | "FILE";

export interface Media {
    id: string;
    url: string;
    type: MediaType;
    fileName: string | null;
    fileSize: number | null;
    position: number;
}

export interface MessageSender {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    type: MessageType;
    status: MessageStatus;
    content: string | null;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
    isEdited: boolean;
    isDeleted: boolean;
    media: Media[];
    sender: MessageSender;
}

export interface ConversationParticipant {
    userId: string;
    isAdmin: boolean;
    joinedAt: string;
    lastReadAt: string | null;
    user: MessageSender;
}

export interface Conversation {
    id: string;
    type: ConversationType;
    status: ConversationStatus;
    updatedAt: string;
    participants: ConversationParticipant[];
    messages: Message[];
    unreadCount?: number;
    name?: string;
    inviteSenderId?: string;
    iconUrl?: string | null;
}
