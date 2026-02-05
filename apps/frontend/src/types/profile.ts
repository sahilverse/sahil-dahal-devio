export interface Experience {
    id: string;
    title: string;
    companyName: string;
    companyLogoUrl: string | null;
    location: string | null;
    type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string | null;
    grade: string | null;
}

export interface Certification {
    id: string;
    name: string;
    issuingOrg: string;
    issueDate: string;
    expirationDate: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    startDate: string;
    endDate: string | null;
    skills: string[];
}

export interface Skill {
    id: string;
    name: string;
    slug: string;
}

export interface UserProfile {
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
    cipherBalance?: number;
    followersCount: number;
    followingCount: number;
    joinedAt: string;
    devioAge: string;
    isFollowing: boolean;
    isOwner: boolean;

    currentStreak: number;
    longestStreak: number;
    activityMap: Array<{ date: string; count: number }>;

    contributions: {
        total: number,
        posts: number,
        comments: number,
    }

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

    experiences: Experience[];
    educations: Education[];
    certifications: Certification[];
    projects: Project[];
    skills: Skill[];
}