import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { UserController } from "./user.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { onboardingSchema } from "@devio/zod-utils";

const router: Router = Router();
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const userController = container.get<UserController>(TYPES.UserController);

/**
 * @swagger
 * /users/onboarding:
 *   patch:
 *     summary: Complete user profile onboarding
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already taken
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/onboarding",
    authMiddleware.guard,
    validateRequest(onboardingSchema),
    userController.completeOnboarding
);

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     description: Returns public profile for everyone, private profile for owner.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:username",
    authMiddleware.extractUser,
    userController.getProfile
);

/**
 * @swagger
 * /users/{username}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Already following
 *       500:
 *         description: Internal server error
 */
router.post(
    "/:username/follow",
    authMiddleware.guard,
    userController.followUser
);

/**
 * @swagger
 * /users/{username}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:username/follow",
    authMiddleware.guard,
    userController.unfollowUser
);

export { router };
