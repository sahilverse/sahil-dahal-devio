import { Exclude, Expose, Transform, Type } from "class-transformer";

// ─── Nested DTOs ───────────────────────────────────────

@Exclude()
export class CourseAuthorDto {
    @Expose() id!: string;
    @Expose() username!: string;
    @Expose() firstName!: string;
    @Expose() lastName!: string;
    @Expose() avatarUrl!: string;
}

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
    @Expose() duration!: number;
    @Expose() order!: number;
    @Expose() isPreview!: boolean;
}

@Exclude()
export class ModuleSummaryDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() order!: number;

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
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() description!: string;
    @Expose() thumbnailUrl!: string;

    @Expose()
    @Transform(({ value }) => Number(value))
    price!: number;

    @Expose() isFree!: boolean;
    @Expose() isPublished!: boolean;
    @Expose() createdAt!: Date;

    @Expose()
    @Type(() => CourseAuthorDto)
    author!: CourseAuthorDto;

    @Expose()
    @Transform(({ obj }) =>
        obj.courseTopics?.map((ct: any) => ({
            id: ct.topic?.id,
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
}

// ─── Course Detail ────────────────────────────────────

@Exclude()
export class CourseDetailDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() description!: string;
    @Expose() thumbnailUrl!: string;

    @Expose()
    @Transform(({ value }) => Number(value))
    price!: number;

    @Expose() isFree!: boolean;
    @Expose() maxCipherDiscount!: number;
    @Expose() isPublished!: boolean;
    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;

    @Expose()
    @Type(() => CourseAuthorDto)
    author!: CourseAuthorDto;

    @Expose()
    @Transform(({ obj }) =>
        obj.courseTopics?.map((ct: any) => ({
            id: ct.topic?.id,
            name: ct.topic?.name,
            slug: ct.topic?.slug,
        })) || []
    )
    topics!: CourseTopicDto[];

    @Expose()
    @Type(() => ModuleSummaryDto)
    modules!: ModuleSummaryDto[];

    @Expose()
    @Type(() => CourseReviewResponseDto)
    reviews!: CourseReviewResponseDto[];

    @Expose()
    @Transform(({ obj }) => obj._count?.enrollments || 0)
    enrollmentCount!: number;

    @Expose()
    @Transform(({ obj }) => obj._count?.reviews || 0)
    reviewCount!: number;

    @Expose()
    @Transform(({ obj }) => {
        if (!obj.enrollments || obj.enrollments.length === 0) return false;
        return true;
    })
    isEnrolled!: boolean;
}

// ─── Full Lesson (enrolled users) ─────────────────────

@Exclude()
export class LessonContentDto {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() content!: string;
    @Expose() videoUrl!: string;
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

// ─── Query DTO ────────────────────────────────────────

@Exclude()
export class GetCoursesDto {
    @Expose() cursor?: string;
    @Expose() limit: number = 12;
    @Expose() topic?: string;
    @Expose() isFree?: boolean;
    @Expose() search?: string;
    @Expose() sortBy?: string;
}
