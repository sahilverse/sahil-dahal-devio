export interface PostResponseDto {
    id: string;
    title: string;
    content?: string;
    type: "TEXT" | "LINK" | "QUESTION" | "POLL";
    linkUrl?: string;
    bountyAmount?: number;
    bountyExpiresAt?: string;
    isBountyPaid: boolean;
    slug: string;
    createdAt: string;
    updatedAt: string;
    voteCount: number;
    commentCount: number;
    viewCount?: number;
    author: {
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
    community?: {
        id: string;
        name: string;
        displayName: string;
        iconUrl?: string;
    };
    media: {
        id: string;
        url: string;
        type: "IMAGE" | "VIDEO" | "FILE";
    }[];
    topics: {
        id: string;
        name: string;
        slug: string;
    }[];
    pollOptions?: {
        id: string;
        text: string;
        votes: number;
    }[];
    userVote?: "UP" | "DOWN";
    isSaved?: boolean;
    isPinned: boolean;
    visibility: "PUBLIC" | "PRIVATE";
}
