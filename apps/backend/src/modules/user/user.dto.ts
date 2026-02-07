import { AccountStatus, Difficulty } from "../../generated/prisma/client";
import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class ActivityLogDTO {
    @Expose()
    @Type(() => Date)
    date!: Date;

    @Expose()
    count!: number;
}

@Exclude()
export class AchievementDTO {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() slug!: string;
    @Expose() description!: string;
    @Expose() iconUrl!: string | null;
}

@Exclude()
export class ExperienceDTO {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() companyName!: string;
    @Expose() companyLogoUrl!: string | null;
    @Expose() location!: string | null;
    @Expose() type!: string | null;

    @Expose()
    @Type(() => Date)
    startDate!: Date;

    @Expose()
    @Type(() => Date)
    endDate!: Date | null;

    @Expose() isCurrent!: boolean;
    @Expose() description!: string | null;
}

@Exclude()
export class EducationDTO {
    @Expose() id!: string;
    @Expose() school!: string;
    @Expose() degree!: string | null;
    @Expose() fieldOfStudy!: string | null;

    @Expose()
    @Type(() => Date)
    startDate!: Date;

    @Expose()
    @Type(() => Date)
    endDate!: Date | null;

    @Expose() grade!: string | null;
}

@Exclude()
export class CertificationDTO {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() issuingOrg!: string;

    @Expose()
    @Type(() => Date)
    issueDate!: Date;

    @Expose()
    @Type(() => Date)
    expirationDate!: Date | null;

    @Expose() credentialId!: string | null;
    @Expose() credentialUrl!: string | null;
}

@Exclude()
export class ProjectDTO {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() description!: string | null;
    @Expose() url!: string | null;

    @Expose()
    @Type(() => Date)
    startDate!: Date | null;

    @Expose()
    @Type(() => Date)
    endDate!: Date | null;

    @Expose() skills!: string[];
}

@Exclude()
export class SkillDTO {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() slug!: string;
}

@Exclude()
export class RecentActivityDTO {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() difficulty!: Difficulty;

    @Expose()
    @Type(() => Date)
    completedAt!: Date;

    @Expose() type!: "PROBLEM" | "ROOM";
}

@Exclude()
export class SocialsDTO {
    @Expose() github?: string | null;
    @Expose() linkedin?: string | null;
    @Expose() twitter?: string | null;
    @Expose() facebook?: string | null;
    @Expose() instagram?: string | null;
    @Expose() youtube?: string | null;
    @Expose() website?: string | null;
}

@Exclude()
export class ContributionsDTO {
    @Expose() total!: number;
    @Expose() posts!: number;
    @Expose() comments!: number;
}

@Exclude()
export class AchievementsMetaDTO {
    @Expose()
    @Type(() => AchievementDTO)
    latest!: AchievementDTO[];

    @Expose() total!: number;
}

@Exclude()
export class ProblemStatsDTO {
    @Expose() total!: number;
    @Expose() easy!: number;
    @Expose() medium!: number;
    @Expose() hard!: number;
}

@Exclude()
export class RoomStatsDTO {
    @Expose() total!: number;
    @Expose() easy!: number;
    @Expose() medium!: number;
    @Expose() hard!: number;
}

@Exclude()
export class PublicProfileDTO {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string | null;
    @Expose() lastName!: string | null;
    @Expose() avatarUrl!: string | null;
    @Expose() bannerUrl!: string | null;
    @Expose() title!: string | null;
    @Expose() city!: string | null;
    @Expose() country!: string | null;

    @Expose()
    @Type(() => SocialsDTO)
    socials!: SocialsDTO | null;

    @Expose() auraPoints!: number;
    @Expose() followersCount!: number;
    @Expose() followingCount!: number;

    @Expose()
    @Type(() => Date)
    joinedAt!: Date;

    @Expose()
    @Type(() => ContributionsDTO)
    contributions!: ContributionsDTO;

    @Expose() devioAge!: string;
    @Expose() isFollowing!: boolean;
    @Expose() isOwner!: boolean;

    @Expose() currentStreak!: number;
    @Expose() longestStreak!: number;

    @Expose()
    @Type(() => ActivityLogDTO)
    activityMap!: ActivityLogDTO[];

    @Expose()
    @Type(() => AchievementsMetaDTO)
    achievements!: AchievementsMetaDTO;

    @Expose()
    @Type(() => ProblemStatsDTO)
    problemStats!: ProblemStatsDTO;

    @Expose()
    @Type(() => RoomStatsDTO)
    roomStats!: RoomStatsDTO;

    @Expose()
    @Type(() => RecentActivityDTO)
    recentActivity!: RecentActivityDTO[];

    @Expose()
    @Type(() => ExperienceDTO)
    experiences!: ExperienceDTO[];

    @Expose()
    @Type(() => EducationDTO)
    educations!: EducationDTO[];

    @Expose()
    @Type(() => CertificationDTO)
    certifications!: CertificationDTO[];

    @Expose()
    @Type(() => ProjectDTO)
    projects!: ProjectDTO[];

    @Expose()
    @Type(() => SkillDTO)
    skills!: SkillDTO[];
}

@Exclude()
export class PrivateProfileDTO extends PublicProfileDTO {
    @Expose() cipherBalance!: number;
    @Expose() accountStatus!: AccountStatus;
}
