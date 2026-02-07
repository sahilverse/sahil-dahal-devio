
import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CommunityController } from "./community.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { createCommunitySchema } from "@devio/zod-utils";

const router: Router = Router();
const communityController = container.get<CommunityController>(TYPES.CommunityController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: Community management
 */

/**
 * @swagger
 * /communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
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
 *               - visibility
 *               - tags
 *             properties:
 *               name:
 *                 type: string
 *                 example: "dev-community"
 *                 minLength: 3
 *                 maxLength: 20
 *               description:
 *                 type: string
 *                 example: "A community for developers"
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE, RESTRICTED]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 5
 *                 example: ["dev", "coding"]
 *     responses:
 *       201:
 *         description: Community created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Name already taken
 */
router.post(
    "/",
    authMiddleware.guard,
    validateRequest(createCommunitySchema),
    communityController.createCommunity
);


/**
 * @swagger
 * /communities/{name}:
 *   get:
 *     summary: Get community by Name
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Community Name
 *     responses:
 *       200:
 *         description: Community fetched successfully
 *       404:
 *         description: Community not found
 */
router.get(
    "/:name",
    authMiddleware.extractUser,
    communityController.getCommunityByName
);

/**
 * @openapi
 * /communities/{name}/moderators:
 *   get:
 *     tags:
 *       - Community
 *     security:
 *       - BearerAuth: []
 *     summary: Get community moderators
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Community Name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moderators fetched successfully
 *       404:
 *         description: Community not found
 */
router.get(
    "/:name/moderators",
    authMiddleware.guard,
    communityController.getModerators
);

export { router };
