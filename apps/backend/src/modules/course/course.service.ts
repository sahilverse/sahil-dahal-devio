import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CourseRepository } from "./course.repository";
import { TopicService } from "../topic/topic.service";
import { CipherService } from "../cipher/cipher.service";
import { NotificationService } from "../notification/notification.service";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import {
    CourseListItemDto,
    CourseDetailDto,
    CourseReviewResponseDto,
} from "./course.dto";
import { CipherReason, NotificationType } from "../../generated/prisma/client";
import slugify from "slugify";
import type {
    CreateCourseInput,
    UpdateCourseInput,
    CreateReviewInput,
    UpdateReviewInput,
    CourseQueryInput,
    EnrollmentQueryInput,
} from "@devio/zod-utils";

@injectable()
export class CourseService {
    constructor(
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.TopicService) private topicService: TopicService,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
    ) { }

    // ─── Course CRUD (Admin) ──────────────────────────────

    async createCourse(authorId: string, data: CreateCourseInput): Promise<CourseListItemDto> {
        const slug = slugify(data.title, { lower: true, strict: true });

        // Check if slug already exists
        const existing = await this.courseRepository.findBySlug(slug);
        if (existing) {
            throw new ApiError("A course with this title already exists", StatusCodes.CONFLICT);
        }

        // Resolve topics
        const topicIds: string[] = [];
        if (data.topics && data.topics.length > 0) {
            for (const topicName of data.topics) {
                const topic = await this.topicService.createTopic(topicName);
                if (topic) topicIds.push(topic.id);
            }
        }

        const course = await this.courseRepository.create({
            title: data.title,
            slug,
            description: data.description,
            price: data.price || 0,
            isFree: data.isFree || false,
            maxCipherDiscount: data.maxCipherDiscount,
            isPublished: data.isPublished || false,
            author: { connect: { id: authorId } },
            courseTopics: {
                create: topicIds.map(topicId => ({
                    topic: { connect: { id: topicId } },
                })),
            },
        });

        return plainToInstance(CourseListItemDto, course, { excludeExtraneousValues: true });
    }

    async updateCourse(courseId: string, data: UpdateCourseInput): Promise<CourseListItemDto> {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);

        const updateData: any = { ...data };
        delete updateData.topics;

        // If title is being updated, regenerate slug
        if (data.title && data.title !== course.title) {
            updateData.slug = slugify(data.title, { lower: true, strict: true });
            const existing = await this.courseRepository.findBySlug(updateData.slug);
            if (existing && existing.id !== courseId) {
                throw new ApiError("A course with this title already exists", StatusCodes.CONFLICT);
            }
        }

        // Sync topics if provided
        if (data.topics) {
            const topicIds: string[] = [];
            for (const topicName of data.topics) {
                const topic = await this.topicService.createTopic(topicName);
                if (topic) topicIds.push(topic.id);
            }
            await this.courseRepository.syncTopics(courseId, topicIds);
        }

        const updated = await this.courseRepository.update(courseId, updateData);
        return plainToInstance(CourseListItemDto, updated, { excludeExtraneousValues: true });
    }

    async deleteCourse(courseId: string): Promise<void> {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
        await this.courseRepository.delete(courseId);
    }

    // ─── Course Queries ───────────────────────────────────

    async getCourses(query: CourseQueryInput, currentUserId?: string) {
        const courses = await this.courseRepository.findMany({
            cursor: query.cursor,
            limit: query.limit,
            topicSlug: query.topic,
            isFree: query.isFree,
            search: query.search,
            sortBy: query.sortBy,
            isPublished: true,
        });

        let nextCursor: string | null = null;
        if (courses.length > query.limit) {
            const nextItem = courses.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            courses: plainToInstance(CourseListItemDto, courses as any[], { excludeExtraneousValues: true }),
            nextCursor,
        };
    }

    async getCourseBySlug(slug: string, currentUserId?: string): Promise<CourseDetailDto> {
        const course = await this.courseRepository.findBySlug(slug, currentUserId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
        if (!course.isPublished) {
            // Only author can see unpublished courses
            if (course.authorId !== currentUserId) {
                throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
            }
        }

        return plainToInstance(CourseDetailDto, course, { excludeExtraneousValues: true });
    }

    async getMyEnrollments(userId: string, query: EnrollmentQueryInput) {
        const { limit, cursor } = query;
        const enrollments = await this.courseRepository.findEnrollmentsByUser(userId, limit, cursor);

        let nextCursor: string | undefined = undefined;
        if (enrollments.length > limit) {
            const nextItem = enrollments.pop();
            nextCursor = nextItem?.id;
        }

        const items = enrollments.map((e: any) => ({
            ...plainToInstance(CourseListItemDto, e.course, { excludeExtraneousValues: true }),
            enrollmentStatus: e.status,
            enrolledAt: e.createdAt,
        }));

        return { items, nextCursor };
    }

    // ─── Enrollment ───────────────────────────────────────

    async enrollInCourse(
        userId: string,
        courseId: string,
        options: { useCipherCoins?: boolean; cipherAmount?: number }
    ) {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
        if (!course.isPublished) throw new ApiError("Course is not available for enrollment", StatusCodes.BAD_REQUEST);

        // Check if already enrolled
        const existingEnrollment = await this.courseRepository.findEnrollment(userId, courseId);
        if (existingEnrollment) throw new ApiError("You are already enrolled in this course", StatusCodes.CONFLICT);

        // Free course: direct enrollment
        if (course.isFree || Number(course.price) === 0) {
            const enrollment = await this.courseRepository.createEnrollment(userId, courseId);

            // Notify
            this.notificationService.notify({
                userId,
                type: NotificationType.COURSE_ENROLLMENT,
                title: "Enrollment Successful! 🎓",
                message: `You have been enrolled in "${course.title}". Start learning now!`,
                actionUrl: `/courses/${course.slug}`,
            }).catch(err => logger.error(`Notification failed for enrollment: ${err.message}`));

            return { enrollment, requiresPayment: false };
        }

        // Paid course with full cipher discount
        if (options.useCipherCoins && options.cipherAmount) {
            const maxDiscount = course.maxCipherDiscount ?? Number(course.price);
            const effectiveCipherAmount = Math.min(options.cipherAmount, maxDiscount, Number(course.price));
            const remainingAmount = Number(course.price) - effectiveCipherAmount;

            if (remainingAmount <= 0) {
                // Full cipher purchase
                await this.cipherService.spendCipher(
                    userId,
                    effectiveCipherAmount,
                    CipherReason.COURSE_DISCOUNT,
                    courseId
                );

                const enrollment = await this.courseRepository.createEnrollment(userId, courseId);

                this.notificationService.notify({
                    userId,
                    type: NotificationType.COURSE_ENROLLMENT,
                    title: "Enrollment Successful! 🎓",
                    message: `You used ${effectiveCipherAmount} Cipher coins to enroll in "${course.title}".`,
                    actionUrl: `/courses/${course.slug}`,
                }).catch(err => logger.error(`Notification failed for enrollment: ${err.message}`));

                return { enrollment, requiresPayment: false, cipherSpent: effectiveCipherAmount };
            }

            // Partial cipher discount — return info for payment initiation
            return {
                requiresPayment: true,
                courseId: course.id,
                originalPrice: Number(course.price),
                cipherDiscount: effectiveCipherAmount,
                amountToPay: remainingAmount,
            };
        }

        // Paid course: requires eSewa payment
        return {
            requiresPayment: true,
            courseId: course.id,
            originalPrice: Number(course.price),
            cipherDiscount: 0,
            amountToPay: Number(course.price),
        };
    }

    // ─── Reviews ──────────────────────────────────────────

    async createReview(userId: string, courseId: string, data: CreateReviewInput): Promise<CourseReviewResponseDto> {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);

        // Only enrolled users can review
        const enrollment = await this.courseRepository.findEnrollment(userId, courseId);
        if (!enrollment) throw new ApiError("You must be enrolled to review this course", StatusCodes.FORBIDDEN);

        // Check if already reviewed
        const existingReview = await this.courseRepository.findReview(courseId, userId);
        if (existingReview) throw new ApiError("You have already reviewed this course", StatusCodes.CONFLICT);

        const review = await this.courseRepository.createReview(courseId, userId, data.rating, data.comment);
        return plainToInstance(CourseReviewResponseDto, review, { excludeExtraneousValues: true });
    }

    async updateReview(userId: string, reviewId: string, data: UpdateReviewInput): Promise<CourseReviewResponseDto> {
        const review = await this.courseRepository.findReviewById(reviewId);
        if (!review) throw new ApiError("Review not found", StatusCodes.NOT_FOUND);
        if (review.userId !== userId) throw new ApiError("You can only edit your own review", StatusCodes.FORBIDDEN);

        const updated = await this.courseRepository.updateReview(reviewId, data);
        return plainToInstance(CourseReviewResponseDto, updated, { excludeExtraneousValues: true });
    }

    async deleteReview(userId: string, reviewId: string): Promise<void> {
        const review = await this.courseRepository.findReviewById(reviewId);
        if (!review) throw new ApiError("Review not found", StatusCodes.NOT_FOUND);
        if (review.userId !== userId) throw new ApiError("You can only delete your own review", StatusCodes.FORBIDDEN);

        await this.courseRepository.deleteReview(reviewId);
    }

    async getReviews(courseId: string, limit: number = 10, cursor?: string) {
        const reviews = await this.courseRepository.findReviews(courseId, limit, cursor);

        let nextCursor: string | null = null;
        if (reviews.length > limit) {
            const nextItem = reviews.pop();
            nextCursor = nextItem?.id || null;
        }

        const rating = await this.courseRepository.getAverageRating(courseId);

        return {
            reviews: plainToInstance(CourseReviewResponseDto, reviews as any[], { excludeExtraneousValues: true }),
            nextCursor,
            averageRating: rating.average,
            totalReviews: rating.count,
        };
    }
}
