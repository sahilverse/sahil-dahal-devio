import { Exclude, Expose } from "class-transformer";
import { CreateCommunityInput } from "@devio/zod-utils";
import { CommunityVisibility } from "../../generated/prisma/client";

@Exclude()
export class CreateCommunityDto implements CreateCommunityInput {
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
    @Expose() moderators?: { id: string, username: string; avatarUrl?: string; }[];
    @Expose() activeMembers?: number;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;
}

@Exclude()
export class GetModeratorsDto {
    @Expose() moderators!: { id: string; username: string; avatarUrl?: string; joinedAt: Date }[];
    @Expose() nextCursor?: string;
}
