import { AccountStatus } from "../../../generated/prisma/client";

export interface PublicProfileDTO {
    id: string;
    username: string; // Guaranteed to be present on profile
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    socials: any;

    // Stats
    auraPoints: number;
    followersCount: number;
    followingCount: number;
    joinedAt: Date;

    // Computed in Service
    devioAge: string;
    isFollowing: boolean;

    // Activity & Streaks
    currentStreak: number;
    longestStreak: number;
    activityMap: any[]; // { date: string, count: number }

    // Achievements
    achievements: any[];

    // Detailed Stats
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

    recentActivity: {
        id: string;
        title: string;
        slug: string;
        difficulty: string;
        completedAt: Date;
        type: 'PROBLEM' | 'ROOM';
    }[];

    // Professional
    experiences: any[];
    educations: any[];
    certifications: any[];
    projects: any[];
    skills: any[];
}

export interface PrivateProfileDTO extends PublicProfileDTO {
    cipherBalance: number;
    accountStatus: AccountStatus;
}
