import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { CourseController } from "./course.controller";
import { ModuleController } from "./modules/module.controller";
import { LessonController } from "./lessons/lesson.controller";
import { AuthMiddleware, validateRequest, videoUpload } from "../../middlewares";
import {
    createCourseSchema,
    updateCourseSchema,
    createModuleSchema,
    updateModuleSchema,
    createLessonSchema,
    updateLessonSchema,
} from "@devio/zod-utils";

const router: Router = Router();
const courseController = container.get<CourseController>(TYPES.CourseController);
const moduleController = container.get<ModuleController>(TYPES.ModuleController);
const lessonController = container.get<LessonController>(TYPES.LessonController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

router.use(authMiddleware.guard);
router.use(authMiddleware.verifiedOnly);
router.use(authMiddleware.adminOnly);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Admin Course Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Advanced Node.js Microservices"
 *               description:
 *                 type: string
 *                 example: "Master the art of building scalable microservices with TypeScript and Docker."
 *               price:
 *                 type: number
 *                 default: 0
 *               isFree:
 *                 type: boolean
 *                 default: false
 *               maxCipherDiscount:
 *                 type: integer
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["backend", "microservices", "docker"]
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post(
    "/",
    validateRequest(createCourseSchema),
    courseController.createCourse
);

/**
 * @swagger
 * /courses/{courseId}:
 *   patch:
 *     summary: Update a course (Admin only)
 *     tags: [Admin Course Management]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               isFree:
 *                 type: boolean
 *               maxCipherDiscount:
 *                 type: integer
 *               isPublished:
 *                 type: boolean
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Course updated
 */
router.patch(
    "/:courseId",
    validateRequest(updateCourseSchema),
    courseController.updateCourse
);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     summary: Delete a course (Admin only)
 *     tags: [Admin Course Management]
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
 *         description: Course deleted
 */
router.delete(
    "/:courseId",
    courseController.deleteCourse
);

// ─── Admin Module Routes ───────────────────────────────

/**
 * @swagger
 * /courses/{courseId}/modules:
 *   post:
 *     summary: Create a new module in a course (Admin only)
 *     tags: [Admin Course Management]
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Module 1: Introduction to Microservices"
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Module created successfully
 *       404:
 *         description: Course not found
 */
router.post(
    "/:courseId/modules",
    validateRequest(createModuleSchema),
    moduleController.createModule
);

/**
 * @swagger
 * /courses/modules/{moduleId}:
 *   patch:
 *     summary: Update a module (Admin only)
 *     tags: [Admin Course Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated successfully
 *       404:
 *         description: Module not found
 */
router.patch(
    "/modules/:moduleId",
    validateRequest(updateModuleSchema),
    moduleController.updateModule
);

/**
 * @swagger
 * /courses/modules/{moduleId}:
 *   delete:
 *     summary: Delete a module (Admin only)
 *     tags: [Admin Course Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *       404:
 *         description: Module not found
 */
router.delete(
    "/modules/:moduleId",
    moduleController.deleteModule
);

// ─── Admin Lesson Routes ───────────────────────────────

/**
 * @swagger
 * /courses/modules/{moduleId}/lessons:
 *   post:
 *     summary: Create a new lesson in a module (Admin only)
 *     tags: [Admin Course Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds
 *               order:
 *                 type: integer
 *               isPreview:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       404:
 *         description: Module not found
 */
router.post(
    "/modules/:moduleId/lessons",
    validateRequest(createLessonSchema),
    lessonController.createLesson
);

/**
 * @swagger
 * /courses/lessons/{lessonId}/video:
 *   post:
 *     summary: Upload a raw MP4/MOV video for transcoding (Admin only)
 *     tags: [Admin Course Management]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: The raw video file (max 500MB)
 *     responses:
 *       202:
 *         description: Video upload started and transcoding job queued
 *       400:
 *         description: Invalid file or file missing
 *       404:
 *         description: Lesson not found
 */
router.post(
    "/lessons/:lessonId/video",
    videoUpload.single("video"),
    lessonController.uploadVideo
);

/**
 * @swagger
 * /courses/lessons/{lessonId}:
 *   patch:
 *     summary: Update a lesson (Admin only)
 *     tags: [Admin Course Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *               order:
 *                 type: integer
 *               isPreview:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       404:
 *         description: Lesson not found
 */
router.patch(
    "/lessons/:lessonId",
    validateRequest(updateLessonSchema),
    lessonController.updateLesson
);

/**
 * @swagger
 * /courses/lessons/{lessonId}:
 *   delete:
 *     summary: Delete a lesson (Admin only)
 *     tags: [Admin Course Management]
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
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 */
router.delete(
    "/lessons/:lessonId",
    lessonController.deleteLesson
);

export { router as courseAdminRouter };
