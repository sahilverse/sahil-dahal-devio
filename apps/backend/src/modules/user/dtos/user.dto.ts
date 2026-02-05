import { AccountStatus, Difficulty } from "../../../generated/prisma/client";

export interface ActivityLogDTO {
    date: Date;
    count: number;
}

export interface AchievementDTO {
    id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl: string | null;
}

export interface ExperienceDTO {
    id: string;
    title: string;
    companyName: string;
    companyLogoUrl: string | null;
    location: string | null;
    type: string | null;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    description: string | null;
}

export interface EducationDTO {
    id: string;
    school: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: Date;
    endDate: Date | null;
    grade: string | null;
}

export interface CertificationDTO {
    id: string;
    name: string;
    issuingOrg: string;
    issueDate: Date;
    expirationDate: Date | null;
    credentialId: string | null;
    credentialUrl: string | null;
}

export interface ProjectDTO {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    startDate: Date | null;
    endDate: Date | null;
    skills: string[];
}

export interface SkillDTO {
    id: string;
    name: string;
    slug: string;
}

export interface RecentActivityDTO {
    id: string;
    title: string;
    slug: string;
    difficulty: Difficulty;
    completedAt: Date;
    type: "PROBLEM" | "ROOM";
}


export interface PublicProfileDTO {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    title: string | null;
    city: string | null;
    country: string | null;
    socials: Record<string, string> | null;

    auraPoints: number;
    followersCount: number;
    followingCount: number;
    joinedAt: Date;

    contributions: {
        total: number;
        posts: number;
        comments: number;
    };

    devioAge: string;
    isFollowing: boolean;
    isOwner: boolean;

    currentStreak: number;
    longestStreak: number;
    activityMap: ActivityLogDTO[];

    achievements: {
        latest: AchievementDTO[];
        other: number;
    };

    problemStats: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };
    roomStats: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };

    recentActivity: RecentActivityDTO[];


    experiences: ExperienceDTO[];
    educations: EducationDTO[];
    certifications: CertificationDTO[];
    projects: ProjectDTO[];
    skills: SkillDTO[];
}

export interface PrivateProfileDTO extends PublicProfileDTO {
    cipherBalance: number;
    accountStatus: AccountStatus;
}
