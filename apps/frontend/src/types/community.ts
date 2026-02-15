export interface Community {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    bannerUrl?: string;
    visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
    memberCount: number;
    isMember?: boolean;
    isMod?: boolean;
    activeMembers?: number;
    weeklyVisitors?: number;
    weeklyContributors?: number;
    createdAt: string;
}

export interface CommunitySettings {
    description?: string;
    visibility: "PUBLIC" | "PRIVATE" | "RESTRICTED";
    allowPostImages: boolean;
    allowPostLinks: boolean;
    requirePostApproval: boolean;
    minAuraToPost: number;
    minAuraToComment: number;
    minAuraToJoin?: number;
}

export interface CommunityMember {
    id: string;
    joinedAt: string;
    isMod: boolean;
    permissions?: Record<string, boolean>;
    userId: string;
    username: string;
    avatarUrl?: string;
}

export interface CommunityRule {
    title: string;
    description: string;
}

export interface JoinRequest {
    id: string;
    userId: string;
    communityId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    message?: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
}
