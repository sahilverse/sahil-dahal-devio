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
 * /user/onboarding:
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

export { router };
