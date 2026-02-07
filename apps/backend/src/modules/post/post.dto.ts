import { Exclude, Expose, Transform, Type } from "class-transformer";
import { PostType, PostStatus, PostVisibility, MediaType } from "../../generated/prisma/client";

@Exclude()
class AuthorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string;
    @Expose() lastName!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
class MediaDto {
    @Expose() id!: string;
    @Expose() url!: string;
    @Expose() type!: MediaType;
    @Expose() fileName!: string;
    @Expose() fileSize!: number;
    @Expose() position!: number;
}

@Exclude()
class PollOptionDto {
    @Expose() id!: string;
    @Expose() text!: string;
    @Expose() order!: number;
    @Expose() votes!: number;
}

@Exclude()
class CommunityDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() displayName!: string;
    @Expose() iconUrl!: string;
}

@Exclude()
export class TopicDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() slug!: string;
}

@Exclude()
export class PostResponseDto {
    @Expose() id!: string;
    @Expose() authorId!: string;
    @Expose()
    @Transform(({ obj }) => obj.communityId ? obj.community : undefined)
    communityId!: string;

    @Expose() title!: string;
    @Expose() content!: string;
    @Expose() type!: PostType;
    @Expose() status!: PostStatus;
    @Expose() visibility!: PostVisibility;

    @Expose() upvotes!: number;
    @Expose() downvotes!: number;
    @Expose() commentCount!: number;

    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Transform(({ obj }) => obj.type === PostType.LINK ? obj.linkUrl : undefined)
    linkUrl!: string;

    @Expose()
    @Transform(({ obj }) => obj.type === PostType.QUESTION ? obj.bountyAmount : undefined)
    bountyAmount!: number;

    @Expose()
    @Transform(({ obj }) => obj.type === PostType.QUESTION ? obj.bountyExpiresAt : undefined)
    bountyExpiresAt!: Date;

    @Expose()
    @Transform(({ obj }) => obj.type === PostType.QUESTION ? obj.isBountyPaid : undefined)
    isBountyPaid!: boolean;

    @Expose()
    @Transform(({ obj }) => obj.type === PostType.QUESTION ? obj.acceptedAnswerId : undefined)
    acceptedAnswerId!: string;

    // Nested Objects
    @Expose()
    @Type(() => AuthorDto)
    author!: AuthorDto;

    @Expose()
    @Transform(({ obj }) => obj.communityId ? obj.community : undefined)
    @Type(() => CommunityDto)
    community!: CommunityDto;

    @Expose()
    @Transform(({ obj }) => {
        if (obj.type === PostType.LINK || obj.type === PostType.POLL) return undefined;
        return obj.media?.map((m: any) => ({
            id: m.id,
            url: m.url,
            type: m.type,
            fileName: m.fileName,
            fileSize: m.fileSize,
            position: m.position,
        })) || [];
    })
    @Type(() => MediaDto)
    media!: MediaDto[];

    @Expose()
    @Transform(({ obj }) => {
        if (obj.type === PostType.POLL) {
            return obj.pollOptions.map((option: any) => ({
                id: option.id,
                text: option.text,
                order: option.order,
                votes: option.votes,
            }));
        }
        return undefined;
    })
    @Type(() => PollOptionDto)
    pollOptions!: PollOptionDto[];

    // Flattened Topics
    @Expose()
    @Transform(({ obj }) => obj.topics.map((t: any) => ({
        id: t.topic?.id,
        name: t.topic?.name,
        slug: t.topic?.slug
    })))
    topics!: TopicDto[];
}

@Exclude()
export class UpdatePostDto {
    @Expose()
    @Transform(({ value }) => value?.trim())
    title?: string;

    @Expose()
    content?: string;

    @Expose()
    status?: PostStatus;

    @Expose()
    visibility?: PostVisibility;

    @Expose()
    isPinned?: boolean;
}

@Exclude()
export class GetPostsDto {
    @Expose()
    cursor?: string;

    @Expose()
    @Type(() => Number)
    limit: number = 10;

    @Expose()
    userId?: string;

    @Expose()
    communityId?: string;

    @Expose()
    status?: PostStatus;

    @Expose()
    visibility?: PostVisibility;
}
