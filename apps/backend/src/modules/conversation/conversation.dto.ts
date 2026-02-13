import { ConversationStatus, ConversationType, MediaType, MessageStatus, MessageType } from "../../generated/prisma/client";
import { Exclude, Expose, Transform, Type } from "class-transformer";

@Exclude()
export class MediaDTO {
    @Expose() id!: string;
    @Expose() url!: string;
    @Expose() type!: MediaType;
    @Expose() fileName!: string | null;
    @Expose() fileSize!: number | null;
    @Expose() position!: number;
}

@Exclude()
export class MessageSenderDTO {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() avatarUrl!: string | null;
}

@Exclude()
export class MessageDTO {
    @Expose() id!: string;
    @Expose() conversationId!: string;
    @Expose() senderId!: string;
    @Expose() type!: MessageType;
    @Expose() status!: MessageStatus;

    @Expose()
    @Type(() => Date)
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    editedAt!: Date | null;

    @Expose()
    @Type(() => Date)
    deletedAt!: Date | null;

    @Expose()
    @Type(() => MediaDTO)
    media!: MediaDTO[];

    @Expose()
    @Type(() => MessageSenderDTO)
    sender!: MessageSenderDTO;

    @Expose()
    get isEdited(): boolean {
        return !!this.editedAt;
    }

    @Expose()
    get isDeleted(): boolean {
        return !!this.deletedAt;
    }

    @Expose()
    @Transform(({ obj, value }) => (obj.deletedAt ? "This message was removed" : value))
    content!: string | null;

}

@Exclude()
export class ConversationParticipantDTO {
    @Expose() userId!: string;
    @Expose() isAdmin!: boolean;

    @Expose()
    @Type(() => Date)
    joinedAt!: Date;

    @Expose()
    @Type(() => Date)
    lastReadAt!: Date | null;

    @Expose()
    @Type(() => MessageSenderDTO)
    user!: MessageSenderDTO;
}

@Exclude()
export class ConversationDTO {
    @Expose() id!: string;
    @Expose() type!: ConversationType;
    @Expose() status!: ConversationStatus;

    @Expose()
    @Type(() => Date)
    updatedAt!: Date;

    @Expose()
    @Type(() => ConversationParticipantDTO)
    participants!: ConversationParticipantDTO[];

    @Expose()
    @Type(() => MessageDTO)
    messages!: MessageDTO[];

    @Expose()
    unreadCount?: number;

    @Expose()
    name?: string;

    @Expose()
    inviteSenderId?: string;

    @Expose()
    iconUrl?: string | null;
}
