export interface CommentAuthor {
    id: string;
    username: string;
    avatarUrl?: string;
}

export interface CommentMedia {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO" | "FILE";
    fileName: string;
    fileSize: number;
    position: number;
}

export interface CommentResponseDto {
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    voteCount: number;
    replyCount: number;
    isDeleted: boolean;
    userVote?: "UP" | "DOWN";
    createdAt: string;
    updatedAt: string;
    author: CommentAuthor;
    media: CommentMedia[];
    replies?: CommentResponseDto[];
}

export interface GetCommentsParams {
    cursor?: string;
    limit?: number;
    sort?: "best" | "newest" | "oldest";
}

export interface GetRepliesParams {
    cursor?: string;
    limit?: number;
}
