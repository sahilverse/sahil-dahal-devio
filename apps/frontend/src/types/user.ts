export interface UserProfile {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    socials: Record<string, string> | null;

    auraPoints: number;
    cipherPoints?: number; // Added for owner view
    followersCount: number;
    followingCount: number;
    joinedAt: string;
    devioAge: string;
    isFollowing: boolean;

    currentStreak: number;
    longestStreak: number;
    activityMap: Array<{ date: string; count: number }>;

    achievements: Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        iconUrl: string | null;
    }>;

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
    recentActivity: Array<{
        id: string;
        title: string;
        slug: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        completedAt: string;
        type: "PROBLEM" | "ROOM";
    }>;

    experiences: Array<Record<string, unknown>>;
    educations: Array<Record<string, unknown>>;
    certifications: Array<Record<string, unknown>>;
    projects: Array<Record<string, unknown>>;
    skills: Array<Record<string, unknown>>;
}
