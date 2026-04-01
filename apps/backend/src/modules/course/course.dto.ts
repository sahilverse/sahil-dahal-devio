import { Exclude, Expose, Transform, Type } from "class-transformer";

// ─── Nested DTOs ───────────────────────────────────────

@Exclude()
export class CourseTopicDto {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() slug!: string;
}

@Exclude()
export class LessonSummaryDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() videoStatus!: string;
    @Expose() duration!: number;
    @Expose() order!: number;
    @Expose() isPreview!: boolean;

    @Expose()
    @Transform(({ obj }) => (obj.videoUrl ? "VIDEO" : "TEXT"))
    type!: "VIDEO" | "TEXT";
}

@Exclude()
export class ModuleSummaryDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() order!: number;

    @Expose()
    @Transform(({ obj }) => obj._count?.lessons ?? 0)
    lessonCount!: number;

    @Expose()
    @Type(() => LessonSummaryDto)
    lessons!: LessonSummaryDto[];
}

@Exclude()
export class ReviewAuthorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string;
    @Expose() lastName!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
export class CourseReviewResponseDto {
    @Expose() id!: string;
    @Expose() rating!: number;
    @Expose() comment!: string;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Type(() => ReviewAuthorDto)
    user!: ReviewAuthorDto;
}

// ─── Course List Item ─────────────────────────────────

@Exclude()
export class CourseListItemDto {
    @Expose() id!: string;
    @Expose() progress!: number;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() description!: string;
    @Expose() thumbnailUrl!: string;

    @Expose()
    @Transform(({ obj }) => (obj.price ? Number(obj.price) : 0))
    price!: number;

    @Expose() isFree!: boolean;
    @Expose() isPublished!: boolean;
    @Expose() createdAt!: Date;

    @Expose()
    @Transform(({ obj }) =>
        obj.courseTopics?.map((ct: any) => ({
            name: ct.topic?.name,
            slug: ct.topic?.slug,
        })) || []
    )
    topics!: CourseTopicDto[];

    @Expose()
    @Transform(({ obj }) => obj._count?.enrollments || 0)
    enrollmentCount!: number;

    @Expose()
    @Transform(({ obj }) => obj._count?.reviews || 0)
    reviewCount!: number;

    @Expose()
    averageRating!: number;

    @Expose()
    duration!: number;
}

// ─── Course Detail ────────────────────────────────────

@Exclude()
export class CourseDetailDto {
    @Expose() id!: string;
    @Expose() progress?: number;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() description!: string;
    @Expose() thumbnailUrl!: string;

    @Expose()
    @Transform(({ obj }) => (obj.price ? Number(obj.price) : 0))
    price!: number;

    @Expose() isFree!: boolean;

    @Expose()
    @Transform(({ value }) => (value ? Number(value) : 0))
    maxCipherDiscount!: number;
    @Expose() isPublished!: boolean;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Transform(({ obj }) =>
        obj.courseTopics?.map((ct: any) => ({
            name: ct.topic?.name,
            slug: ct.topic?.slug,
        })) || []
    )
    topics!: CourseTopicDto[];

    @Expose()
    @Transform(({ obj }) => obj._count?.enrollments || 0)
    enrollmentCount!: number;

    @Expose()
    @Transform(({ obj }) => obj._count?.reviews || 0)
    reviewCount!: number;

    @Expose()
    isEnrolled!: boolean;

    @Expose()
    averageRating!: number;

    @Expose()
    duration!: number;
}

// ─── Full Lesson (enrolled users) ─────────────────────

@Exclude()
export class LessonContentDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() content!: string;
    @Expose() videoUrl!: string;
    @Expose() videoStatus!: string;
    @Expose() duration!: number;
    @Expose() order!: number;
    @Expose() isPreview!: boolean;
}

// ─── Course Progress ──────────────────────────────────

@Exclude()
export class CourseProgressDto {
    @Expose() totalLessons!: number;
    @Expose() completedLessons!: number;
    @Expose() percentage!: number;
    @Expose() completedLessonIds!: string[];
}

@Exclude()
export class ModuleListDto {
    @Expose()
    @Type(() => ModuleSummaryDto)
    items!: ModuleSummaryDto[];

    @Expose() nextCursor?: string;
}

@Exclude()
export class LessonListDto {
    @Expose()
    @Type(() => LessonSummaryDto)
    items!: LessonSummaryDto[];

    @Expose() nextCursor?: string;
}

@Exclude()
export class CourseListDto {
    @Expose()
    @Type(() => CourseListItemDto)
    items!: CourseListItemDto[];

    @Expose() nextCursor?: string | null;
}

@Exclude()
export class CourseReviewListDto {
    @Expose()
    @Type(() => CourseReviewResponseDto)
    items!: CourseReviewResponseDto[];

    @Expose() nextCursor?: string | null;

    @Expose() averageRating!: number;
    @Expose() totalReviews!: number;
}

// ─── Query DTO ────────────────────────────────────────

@Exclude()
export class MediaResponseDto {
    @Expose() id!: string;
    @Expose() url!: string;
    @Expose() type!: string;
    @Expose() fileName?: string;
    @Expose() fileSize?: number;
    @Expose() position!: number;
}

@Exclude()
export class GetCoursesDto {
    @Expose() cursor?: string;
    @Expose() limit: number = 12;
    @Expose() topic?: string;
    @Expose() isFree?: boolean;
    @Expose() search?: string;
    @Expose() sortBy?: string;
}


// ─── Lesson Comments ──────────────────────────────────

@Exclude()
export class LessonCommentAuthorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string;
    @Expose() lastName!: string;
    @Expose() avatarUrl!: string;
}

@Exclude()
export class LessonCommentResponseDto {
    @Expose() id!: string;
    @Expose() lessonId!: string;
    @Expose() parentId!: string | null;
    @Expose() content!: string;
    @Expose() deletedAt!: Date | null;
    @Expose() upvotes!: number;
    @Expose() downvotes!: number;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Type(() => LessonCommentAuthorDto)
    user!: LessonCommentAuthorDto;

    @Expose()
    @Transform(({ obj }) => obj._count?.replies || 0)
    replyCount!: number;


    @Expose()
    @Transform(({ obj }) => obj.votes?.[0]?.type || null)
    userVote!: "UP" | "DOWN" | null;

    @Expose()
    @Type(() => LessonCommentResponseDto)
    replies?: LessonCommentResponseDto[];
}


@Exclude()
export class LessonCommentListDto {
    @Expose()
    @Type(() => LessonCommentResponseDto)
    items!: LessonCommentResponseDto[];

    @Expose() nextCursor?: string | null;
}
