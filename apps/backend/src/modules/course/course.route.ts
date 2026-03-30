import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { CourseController } from "./course.controller";
import { ModuleController } from "./modules/module.controller";
import { LessonController } from "./lessons/lesson.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { validateQuery } from "../../middlewares/validation";
import {
    enrollCourseSchema,
    createReviewSchema,
    updateReviewSchema,
    courseQuerySchema,
    moduleQuerySchema,
    lessonQuerySchema,
    createLessonCommentSchema,
    lessonCommentQuerySchema,
    enrollmentQuerySchema,
} from "@devio/zod-utils";
import { courseAdminRouter } from "./course.admin.route";

const router: Router = Router();
const courseController = container.get<CourseController>(TYPES.CourseController);
const moduleController = container.get<ModuleController>(TYPES.ModuleController);
const lessonController = container.get<LessonController>(TYPES.LessonController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

// ─── Public Routes ─────────────────────────────────────

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List published courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by topic slug
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [NEWEST, POPULAR, PRICE_LOW, PRICE_HIGH]
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 */
router.get(
    "/",
    authMiddleware.extractUser,
    validateQuery(courseQuerySchema),
    courseController.getCourses
);

/**
 * @swagger
 * /courses/{courseId}/modules:
 *   get:
 *     summary: Get modules in a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modules fetched successfully
 */
router.get(
    "/:courseId/modules",
    validateQuery(moduleQuerySchema),
    moduleController.getModules
);

/**
 * @swagger
 * /courses/modules/{moduleId}/lessons:
 *   get:
 *     summary: Get lessons in a module
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get(
    "/modules/:moduleId/lessons",
    validateQuery(lessonQuerySchema),
    lessonController.getLessons
);

/**
 * @swagger
 * /courses/{courseId}/reviews:
 *   get:
 *     summary: Get course reviews
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 */
router.get("/:courseId/reviews", courseController.getReviews);

/**
 * @swagger
 * /courses/my-enrollments:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: My enrollments fetched successfully
 */
router.get(
    "/my-enrollments",
    authMiddleware.guard,
    validateQuery(enrollmentQuerySchema),
    courseController.getMyEnrollments
);

/**
 * @swagger
 * /courses/{slug}:
 *   get:
 *     summary: Get course details by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course fetched successfully
 *       404:
 *         description: Course not found
 */
router.get(
    "/:slug",
    authMiddleware.extractUser,
    courseController.getCourseBySlug
);

// ─── Authenticated Routes ──────────────────────────────

/**
 * @swagger
 * /courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               useCipherCoins:
 *                 type: boolean
 *               cipherAmount:
 *                 type: integer
 *               promoCode:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [ESEWA, KHALTI]
 *     responses:
 *       201:
 *         description: Enrolled successfully
 *       200:
 *         description: Payment required for enrollment
 */
router.post(
    "/:courseId/enroll",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(enrollCourseSchema),
    courseController.enrollInCourse
);

/**
 * @swagger
 * /courses/lessons/{lessonId}/content:
 *   get:
 *     summary: Get full lesson content (requires enrollment)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson content fetched successfully
 *       403:
 *         description: Not enrolled
 */
router.get(
    "/lessons/:lessonId/content",
    authMiddleware.guard,
    lessonController.getLessonContent
);

/**
 * @swagger
 * /courses/lessons/{lessonId}/progress:
 *   post:
 *     summary: Update lesson completion status
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.post(
    "/lessons/:lessonId/progress",
    authMiddleware.guard,
    lessonController.updateProgress
);

/**
 * @swagger
 * /courses/lessons/{lessonId}/comments:
 *   get:
 *     summary: Get comments for a lesson
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 */
router.get(
    "/lessons/:lessonId/comments",
    authMiddleware.extractUser,
    validateQuery(lessonCommentQuerySchema),
    lessonController.getComments
);

/**
 * @swagger
 * /courses/lessons/{lessonId}/comments:
 *   post:
 *     summary: Post a comment on a lesson (enrolled users only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment posted
 *       403:
 *         description: Not enrolled
 */
router.post(
    "/lessons/:lessonId/comments",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(createLessonCommentSchema),
    lessonController.createComment
);

/**
 * @swagger
 * /courses/{courseId}/progress:
 *   get:
 *     summary: Get user's progress in a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress fetched successfully
 */
router.get(
    "/:courseId/progress",
    authMiddleware.guard,
    lessonController.getCourseProgress
);

/**
 * @swagger
 * /courses/{courseId}/reviews:
 *   post:
 *     summary: Submit a review for a course (enrolled users only)
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted
 *       403:
 *         description: Not enrolled
 */
router.post(
    "/:courseId/reviews",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(createReviewSchema),
    courseController.createReview
);

/**
 * @swagger
 * /courses/reviews/{reviewId}:
 *   patch:
 *     summary: Update a review
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Review updated
 */
router.patch(
    "/reviews/:reviewId",
    authMiddleware.guard,
    validateRequest(updateReviewSchema),
    courseController.updateReview
);

/**
 * @swagger
 * /courses/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete(
    "/reviews/:reviewId",
    authMiddleware.guard,
    courseController.deleteReview
);

// ─── Administrative Routes ─────────────────────────────
router.use(courseAdminRouter);

export { router };
