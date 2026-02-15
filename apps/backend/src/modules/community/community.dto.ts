import { Exclude, Expose, Type } from "class-transformer";
import { CommunityVisibility } from "../../generated/prisma/client";

@Exclude()
export class CreateCommunityDto {
    @Expose() name!: string;
    @Expose() description?: string;
    @Expose() visibility!: CommunityVisibility;
    @Expose() tags!: string[];
}

@Exclude()
export class CommunityResponseDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() description?: string;
    @Expose() iconUrl?: string;
    @Expose() bannerUrl?: string;
    @Expose() visibility!: CommunityVisibility;
    @Expose() memberCount!: number;
    @Expose() isMember?: boolean;
    @Expose() isMod?: boolean;
    @Expose() activeMembers?: number;
    @Expose() weeklyVisitors?: number;
    @Expose() weeklyContributors?: number;
    @Expose() createdAt!: Date;
}

@Exclude()
export class CommunitySettingsDto {
    @Expose() allowPostImages!: boolean;
    @Expose() allowPostLinks!: boolean;
    @Expose() requirePostApproval!: boolean;
    @Expose() minAuraToPost!: number;
    @Expose() minAuraToComment!: number;
}

@Exclude()
export class GetModeratorsDto {
    @Expose()
    @Type(() => CommunityMemberDto)
    moderators!: CommunityMemberDto[];

    @Expose() nextCursor?: string;
}


@Exclude()
export class CommunityMemberDto {
    @Expose() id!: string;
    @Expose() joinedAt!: Date;
    @Expose() isMod!: boolean;
    @Expose() permissions?: any;

    @Expose()
    @Type(() => Object)
    user!: { id: string; username: string; avatarUrl?: string };
}

@Exclude()
export class GetMembersResponseDto {
    @Expose()
    @Type(() => CommunityMemberDto)
    members!: CommunityMemberDto[];

    @Expose() nextCursor?: string;
}

@Exclude()
export class JoinedCommunityDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() iconUrl!: string | null;
    @Expose() memberCount!: number;
}

@Exclude()
export class GetJoinedCommunitiesResponseDto {
    @Expose()
    @Type(() => JoinedCommunityDto)
    communities!: JoinedCommunityDto[];

    @Expose() nextCursor!: string | null;
}
