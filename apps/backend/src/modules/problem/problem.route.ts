import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { ProblemController } from "./problem.controller";
import { AuthMiddleware } from "../../middlewares";

const router: Router = Router();
const problemController = container.get<ProblemController>(TYPES.ProblemController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Problems
 *   description: Coding problem management and automated processing
 */

/**
 * @swagger
 * /problems/webhook/minio:
 *   post:
 *     summary: Webhook for MinIO bucket events
 *     tags: [Problems]
 *     description: This endpoint is called by MinIO when a new object is created in the devio-problems bucket. It triggers automated boilerplate generation and database synchronization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Event:
 *                 type: string
 *               Records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     s3:
 *                       type: object
 *                       properties:
 *                         bucket:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                         object:
 *                           type: object
 *                           properties:
 *                             key:
 *                               type: string
 *     responses:
 *       200:
 *         description: Webhook received and processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/webhook/minio", problemController.handleMinioWebhook);

/**
 * @swagger
 * /problems/languages:
 *   get:
 *     summary: Get supported languages
 *     tags: [Problems]
 *     description: Returns the list of programming languages available for problem boilerplates.
 *     responses:
 *       200:
 *         description: Languages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["python", "javascript", "java", "cpp"]
 */
router.get("/languages", problemController.getLanguages);

/**
 * @swagger
 * /problems/{slug}:
 *   get:
 *     summary: Get problem details by slug
 *     tags: [Problems]
 *     description: Retrieves detailed problem information including rich markdown description and sample test cases for the code editor.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique URL-friendly name of the problem
 *     responses:
 *       200:
 *         description: Problem successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemResponseDTO'
 *       404:
 *         description: Problem not found
 */
router.get("/:slug", problemController.getProblem);

/**
 * @swagger
 * /problems/{slug}/draft:
 *   patch:
 *     summary: Auto-save code draft
 *     tags: [Problems]
 *     security:
 *       - BearerAuth: []
 *     description: Atomically updates the student's current code progress for a specific language. This enables a seamless cross-device "resume" experience.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the problem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [language, code]
 *             properties:
 *               language:
 *                 type: string
 *                 description: The programming language (e.g., 'python')
 *               code:
 *                 type: string
 *                 description: The current code drafting in the editor
 *     responses:
 *       200:
 *         description: Draft successfully saved
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Problem not found
 */
router.patch("/:slug/draft", authMiddleware.guard, problemController.saveDraft);

/**
 * @swagger
 * /problems/{slug}/boilerplate:
 *   get:
 *     summary: Get language-specific starter code
 *     tags: [Problems]
 *     description: Retrieves the UI-only boilerplate code for a specific language. This endpoint is lazy-loaded and cached in Redis for high performance.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the problem
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [python, javascript, cpp, java, c]
 *         description: The programming language for which to fetch starter code
 *     responses:
 *       200:
 *         description: Boilerplate successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *       404:
 *         description: Boilerplate not found
 */
router.get("/:slug/boilerplate", authMiddleware.extractUser, problemController.getBoilerplate);

export default router;
