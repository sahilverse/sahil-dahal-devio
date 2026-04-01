import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CourseRepository } from "./course.repository";
import { TopicService } from "../topic/topic.service";
import { CipherService } from "../cipher/cipher.service";
import { NotificationService } from "../notification/notification.service";
import { StorageService } from "../storage";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import {
    CourseListItemDto,
    CourseDetailDto,
    CourseReviewResponseDto,
    CourseListDto,
    CourseReviewListDto,
} from "./course.dto";
import { CipherReason, NotificationType } from "../../generated/prisma/client";
import { MINIO_BUCKET_UPLOADS } from "../../config/constants";
import * as path from "path";
import slugify from "slugify";
import {
    CreateCourseInput,
    UpdateCourseInput,
    CreateReviewInput,
    UpdateReviewInput,
    CourseQueryInput,
    EnrollmentQueryInput,
} from "@devio/zod-utils";
import { LessonRepository } from "./lessons/lesson.repository";

@injectable()
export class CourseService {
    constructor(
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.LessonRepository) private lessonRepository: LessonRepository,
        @inject(TYPES.TopicService) private topicService: TopicService,
        @inject(TYPES.CipherService) private cipherService: CipherService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.StorageService) private storageService: StorageService,
    ) { }

    // ─── Course CRUD (Admin) ──────────────────────────────
    
    async updateThumbnail(courseId: string, file: Express.Multer.File): Promise<string> {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);

        const extension = path.extname(file.originalname);
        const fileName = `thumbnails/${courseId}-${Date.now()}${extension}`;

        // Upload to MinIO
        const thumbnailUrl = await this.storageService.uploadFile(file, fileName, MINIO_BUCKET_UPLOADS, true);

        // Update database
        await this.courseRepository.update(courseId, { thumbnailUrl });

        // Cleanup old thumbnail if it exists
        if (course.thumbnailUrl) {
            try {
                await this.storageService.deleteFile(course.thumbnailUrl, MINIO_BUCKET_UPLOADS);
            } catch (err: any) {
                logger.warn(`Failed to delete old thumbnail for course ${courseId}: ${err.message}`);
            }
        }

        return thumbnailUrl;
    }

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

        return plainToInstance(CourseListItemDto, JSON.parse(JSON.stringify(course)), { excludeExtraneousValues: true });
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
        return plainToInstance(CourseListItemDto, JSON.parse(JSON.stringify(updated)), { excludeExtraneousValues: true });
    }

    async deleteCourse(courseId: string): Promise<void> {
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);
        await this.courseRepository.delete(courseId);
    }

    // ─── Course Queries ───────────────────────────────────

    async getCourses(query: CourseQueryInput) {
        const limit = Number(query.limit) || 12;
        const courses = await this.courseRepository.findMany({
            cursor: query.cursor,
            limit,
            topicSlug: query.topic,
            isFree: query.isFree,
            search: query.search,
            sortBy: query.sortBy,
            isPublished: true,
        });

        let nextCursor: string | null = null;
        if (courses.length > limit) {
            const nextItem = courses.pop();
            nextCursor = nextItem?.id || null;
        }

        return plainToInstance(CourseListDto, JSON.parse(JSON.stringify({
            items: courses,
            nextCursor,
        })), { excludeExtraneousValues: true });
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

        const dto = plainToInstance(CourseDetailDto, JSON.parse(JSON.stringify(course)), { excludeExtraneousValues: true });

        // Explicitly set enrollment status and progress
        const enrollment = (course as any).enrollments?.[0];
        dto.isEnrolled = !!enrollment;
        if (enrollment) {
            dto.progress = enrollment.progress;
        }

        return dto;
    }

    async getMyEnrollments(userId: string, query: EnrollmentQueryInput) {
        const limit = Number(query.limit) || 12;
        const { cursor } = query;
        const enrollments = await this.courseRepository.findEnrollmentsByUser(userId, limit, cursor);

        let nextCursor: string | undefined = undefined;
        if (enrollments.length > limit) {
            const nextItem = enrollments.pop();
            nextCursor = nextItem?.id;
        }

        const items = enrollments.map((e: any) => {
            const courseDto = plainToInstance(CourseListItemDto, JSON.parse(JSON.stringify(e.course)), { excludeExtraneousValues: true });
            courseDto.progress = e.progress || 0;
            return {
                ...courseDto,
                enrollmentStatus: e.status,
                enrolledAt: e.createdAt,
            };
        });

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

        // Paid course with potential cipher discount
        if (options.useCipherCoins) {
            const maxDiscount = course.maxCipherDiscount ?? Number(course.price);
            // If amount not provided, assume maximum allowed discount
            const requestedAmount = options.cipherAmount !== undefined ? options.cipherAmount : maxDiscount;
            const effectiveCipherAmount = Math.min(requestedAmount, maxDiscount, Number(course.price));
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

        return plainToInstance(CourseReviewListDto, JSON.parse(JSON.stringify({
            items: reviews,
            nextCursor,
            averageRating: rating.average,
            totalReviews: rating.count,
        })), { excludeExtraneousValues: true });
    }

    async resolveLessonId(userId: string, slug: string, lessonId: string) {
        const course = await this.courseRepository.findBySlug(slug);
        if (!course) throw new ApiError("Course not found", StatusCodes.NOT_FOUND);

        let resolvedId = lessonId;

        if (lessonId === "start") {
            const first = await this.lessonRepository.findFirstLesson(course.id);
            if (!first) throw new ApiError("No lessons found in this course", StatusCodes.NOT_FOUND);
            resolvedId = first.id;
        } else if (lessonId === "resume") {
            const next = await this.lessonRepository.findNextUncompletedLesson(userId, course.id);
            if (!next) {
                // If all completed, just go to first
                const first = await this.lessonRepository.findFirstLesson(course.id);
                resolvedId = first?.id || lessonId;
            } else {
                resolvedId = next.id;
            }
        }

        return { lessonId: resolvedId };
    }
}
