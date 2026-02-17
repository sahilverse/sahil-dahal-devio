import { Exclude, Expose, Transform, Type } from "class-transformer";
import { EventStatus, EventType, ParticipantStatus, EventVisibility } from "../../generated/prisma/client";

@Exclude()
export class EventCreatorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string;
    @Expose() lastName!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
export class EventCommunityDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() iconUrl!: string;
}

@Exclude()
export class EventPrizeDto {
    @Expose() id!: string;
    @Expose() rankFrom!: number;
    @Expose() rankTo!: number;
    @Expose() prize?: string;
    @Expose() description?: string;
    @Expose() auraReward!: number;
    @Expose() cipherReward!: number;
}

@Exclude()
export class EventProblemDto {
    @Expose() id!: string;
    @Expose() eventId!: string;
    @Expose() problemId!: string;
    @Expose() points!: number;

    @Expose()
    @Transform(({ obj }) => obj.problem)
    problem?: any;
}

@Exclude()
export class EventParticipantDto {
    @Expose() id!: string;
    @Expose() userId!: string;
    @Expose() teamName?: string;
    @Expose() status!: ParticipantStatus;
    @Expose() score!: number;
    @Expose() registeredAt!: Date;

    @Expose()
    @Type(() => EventCreatorDto)
    user?: EventCreatorDto;
}

@Exclude()
export class EventResponseDto {
    @Expose() id!: string;
    @Expose() slug!: string;
    @Expose() title!: string;
    @Expose() description!: string;
    @Expose() imageUrl?: string;
    @Expose() type!: EventType;
    @Expose() status!: EventStatus;
    @Expose() startsAt!: Date;
    @Expose() endsAt!: Date;
    @Expose() registrationDeadline?: Date;
    @Expose() minAuraPoints!: number;
    @Expose() entryCipherCost!: number;
    @Expose() maxParticipants?: number;
    @Expose() participationAura!: number;
    @Expose() requiresTeam!: boolean;
    @Expose() teamSize?: number;
    @Expose() externalUrl?: string;
    @Expose() isApproved!: boolean;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;
    @Expose() rules!: string[];

    @Expose()
    @Transform(({ obj }) => obj._count?.participants || 0)
    participantCount!: number;

    @Expose()
    @Transform(({ obj, options }) => {
        const currentUserId = (options as any)?.currentUserId;
        if (!currentUserId || !obj.participants) return undefined;
        return obj.participants.find((p: any) => p.userId === currentUserId);
    })
    @Type(() => EventParticipantDto)
    userParticipation?: EventParticipantDto;

    @Expose()
    canEdit?: boolean;

    @Expose()
    @Type(() => EventCreatorDto)
    createdBy!: EventCreatorDto;

    @Expose()
    @Type(() => EventCommunityDto)
    community?: EventCommunityDto;

    @Expose()
    @Type(() => EventPrizeDto)
    prizes?: EventPrizeDto[];

    @Expose()
    @Type(() => EventProblemDto)
    problems?: EventProblemDto[];
}

@Exclude()
export class GetEventsDto {
    @Expose() cursor?: string;

    @Expose()
    @Type(() => Number)
    limit: number = 10;

    @Expose() status?: EventStatus;
    @Expose() type?: EventType;
    @Expose() communityId?: string;
    @Expose() visibility?: EventVisibility;
}

@Exclude()
export class AddEventProblemDto {
    @Expose() problemId!: string;
    @Expose() points!: number;
    @Expose() order!: number;
}
