import { Exclude, Expose, Transform, Type } from "class-transformer";
import { MediaType } from "../../generated/prisma/client";

@Exclude()
export class CommentAuthorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
export class CommentMediaDto {
    @Expose() id!: string;
    @Expose() url!: string;
    @Expose() type!: MediaType;
    @Expose() fileName!: string;
    @Expose() fileSize!: number;
    @Expose() position!: number;
}

@Exclude()
export class CommentResponseDto {
    @Expose() id!: string;
    @Expose() postId!: string;
    @Expose() parentId!: string | null;
    @Expose() content!: string;

    @Expose()
    @Transform(({ obj }) => (obj.upvotes || 0) - (obj.downvotes || 0))
    voteCount!: number;

    @Expose()
    @Transform(({ obj }) => obj._count?.replies ?? obj.replyCount ?? 0)
    replyCount!: number;

    @Expose()
    @Transform(({ obj }) => !!obj.deletedAt)
    isDeleted!: boolean;

    @Expose()
    @Transform(({ obj, options }) => {
        const currentUserId = (options as any)?.currentUserId;
        if (!currentUserId || !obj.votes) return undefined;
        const vote = obj.votes.find((v: any) => v.userId === currentUserId);
        return vote?.type;
    })
    userVote?: "UP" | "DOWN";

    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Type(() => CommentAuthorDto)
    author!: CommentAuthorDto;

    @Expose()
    @Transform(({ obj }) => {
        return obj.media?.map((m: any) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            fileName: m.fileName,
            fileSize: m.fileSize,
            position: m.position,
        })) || [];
    })
    @Type(() => CommentMediaDto)
    media!: CommentMediaDto[];

    // Preview replies (only for top-level comments)
    @Expose()
    @Transform(({ obj, options }) => {
        if (!obj.replies || obj.replies.length === 0) return undefined;
        const currentUserId = (options as any)?.currentUserId;
        return obj.replies.map((reply: any) => {
            const dto: any = {
                id: reply.id,
                postId: reply.postId,
                parentId: reply.parentId,
                content: reply.content,
                voteCount: (reply.upvotes || 0) - (reply.downvotes || 0),
                replyCount: reply._count?.replies ?? 0,
                isDeleted: !!reply.deletedAt,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
                author: reply.author,
                media: reply.media || [],
            };
            if (currentUserId && reply.votes) {
                const vote = reply.votes.find((v: any) => v.userId === currentUserId);
                dto.userVote = vote?.type;
            }
            return dto;
        });
    })
    replies?: CommentResponseDto[];
}

@Exclude()
export class GetCommentsDto {
    @Expose()
    cursor?: string;

    @Expose()
    @Type(() => Number)
    limit: number = 10;

    @Expose()
    sort: "best" | "newest" | "oldest" = "best";
}
