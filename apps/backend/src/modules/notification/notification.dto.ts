import { Exclude, Expose, Transform, Type } from "class-transformer";
import { NotificationType } from "../../generated/prisma/client";

@Exclude()
export class NotificationActorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
export class NotificationResponseDto {
    @Expose() id!: string;
    @Expose() type!: NotificationType;
    @Expose() title!: string | null;
    @Expose() message!: string;
    @Expose() actionUrl!: string | null;
    @Expose() data!: any;
    @Expose() read_at!: Date | null;
    @Expose() createdAt!: Date;

    @Expose()
    @Type(() => NotificationActorDto)
    actor!: NotificationActorDto | null;

    @Expose()
    @Transform(({ obj }) => !!obj.read_at)
    isRead!: boolean;
}

@Exclude()
export class GetNotificationsDto {
    @Expose()
    @Type(() => Number)
    limit: number = 20;

    @Expose()
    cursor?: string;
}
