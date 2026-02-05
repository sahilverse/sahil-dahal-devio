import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { UserController } from "./user.controller";
import { AuthMiddleware, validateRequest, upload } from "../../middlewares";
import { onboardingSchema, updateProfileSchema, updateNamesSchema } from "@devio/zod-utils";

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

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router.post(
    "/avatar",
    authMiddleware.guard,
    upload.single("avatar"),
    userController.uploadAvatar
);

/**
 * @swagger
 * /users/avatar:
 *   delete:
 *     summary: Remove user avatar
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 */
router.delete(
    "/avatar",
    authMiddleware.guard,
    userController.removeAvatar
);

/**
 * @swagger
 * /users/banner:
 *   post:
 *     summary: Upload user banner
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Banner updated successfully
 */
router.post(
    "/banner",
    authMiddleware.guard,
    upload.single("banner"),
    userController.uploadBanner
);

/**
 * @swagger
 * /users/banner:
 *   delete:
 *     summary: Remove user banner
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Banner removed successfully
 */
router.delete(
    "/banner",
    authMiddleware.guard,
    userController.removeBanner
);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile details
 *     description: Updates the user's title, city, country, and socials.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               city:
 *                 type: string
 *                 maxLength: 50
 *               country:
 *                 type: string
 *                 maxLength: 50
 *               socials:
 *                 type: object
 *                 properties:
 *                   github:
 *                     type: string
 *                     format: uri
 *                   linkedin:
 *                     type: string
 *                     format: uri
 *                   twitter:
 *                     type: string
 *                     format: uri
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                   instagram:
 *                     type: string
 *                     format: uri
 *                   youtube:
 *                     type: string
 *                     format: uri
 *                   website:
 *                     type: string
 *                     format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/profile",
    authMiddleware.guard,
    validateRequest(updateProfileSchema),
    userController.updateProfile
);

/**
 * @swagger
 * /users/names:
 *   patch:
 *     summary: Update user first and last names
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
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Names updated successfully
 */
router.patch(
    "/names",
    authMiddleware.guard,
    validateRequest(updateNamesSchema),
    userController.updateNames
);

export { router };
