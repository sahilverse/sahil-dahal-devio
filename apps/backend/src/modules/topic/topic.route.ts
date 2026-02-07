import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { TopicController } from "./topic.controller";
import { AuthMiddleware, validateRequest, validateQuery } from "../../middlewares";
import { createTopicSchema, searchTopicSchema } from "@devio/zod-utils";

const router: Router = Router();
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const topicController = container.get<TopicController>(TYPES.TopicController);

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "topic_123"
 *         name:
 *           type: string
 *           example: "Typescript"
 *         slug:
 *           type: string
 *           example: "typescript"
 *         postCount:
 *           type: integer
 *           example: 42
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /topics/search:
 *   get:
 *     summary: Search topics by name
 *     description: Returns a list of topics that match the search query. This endpoint is public.
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for topic name (e.g., "tech")
 *     responses:
 *       200:
 *         description: Topics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Topics fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get(
    "/search",
    validateQuery(searchTopicSchema),
    topicController.searchTopics
);

/**
 * @swagger
 * /topics:
 *   post:
 *     summary: Create a new topic
 *     description: Creates a new topic or returns an existing one if the name matches. Requires authentication.
 *     tags: [Topics]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "OpenSource"
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Topic created successfully
 *                 result:
 *                   $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Topic name is required or invalid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    authMiddleware.guard,
    validateRequest(createTopicSchema),
    topicController.createTopic
);

export { router };
