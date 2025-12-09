import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { AuthController } from "./auth.controller";
import { AuthMiddleware, validateRequest } from '../../middlewares';
import { registerSchema, loginSchema, verifyPasswordResetTokenSchema, resetPasswordSchema, verifyEmailVerificationTokenSchema } from "@devio/zod-utils";

const router: Router = Router();
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const authController = container.get<AuthController>(TYPES.AuthController);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (missing fields)
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", validateRequest(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request (missing fields)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */
router.post("/login", validateRequest(loginSchema), authController.login);


/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *    summary: Refresh access and refresh tokens
 *    tags: [Auth]
 *    responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Unauthorized (refresh token missing or invalid)
 *       500:
 *         description: Internal server error
 */
router.post("/token/refresh", authController.refreshTokens);


/**
 * @swagger
 * /auth/logout:
 *   post:
 *    summary: Logout a user
 *    tags: [Auth]
 *    responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate password reset process
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User's email or username
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found (Username does not exist)
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/verify-password-reset-token:
 *   post:
 *     summary: Verify reset OTP token or reset JWT and start reset session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   identifier:
 *                     type: string
 *                   token:
 *                     type: string
 *                     pattern: '^\d{6}$'
 *                     description: "6-digit OTP sent to user's email"
 *                 required:
 *                   - identifier
 *                   - token
 *               - type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     pattern: '^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$'
 *                     description: "JWT reset token"
 *                 required:
 *                   - token
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reset_session_token:
 *                   type: string
 *                   description: Short-lived reset JWT token
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post(
    "/verify-password-reset-token",
    validateRequest(verifyPasswordResetTokenSchema),
    authController.verifyPasswordResetToken
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using reset session JWT
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                type: string
 *                description: Must match newPassword
  *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       401:
 *         description: Unauthorized (missing or invalid reset session token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/reset-password",
    authMiddleware.guardResetPasswordSession,
    validateRequest(resetPasswordSchema),
    authController.resetPassword
);


/**
 * @swagger
 * /auth/send-email-verification-token:
 *   post:
 *     summary: Send email verification token
 *     tags: [Auth]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *               type: string
 *               description: Email to send verification token to. If not provided, uses authenticated user's email.
 *     responses:
 *      200:
 *       description: Email verification token sent successfully
 *     404:
 *      description: User not found
 *     500:
 *      description: Internal server error
 */
router.post("/send-email-verification-token", authController.sendEmailVerificationToken);

/**
 * @swagger
 * /auth/verify-email-verification-token:
 *   post:
 *     summary: Verify email verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   token:
 *                     type: string
 *                     pattern: '^\d{6}$'
 *                     description: "6-digit OTP sent to user's email"
 *                 required:
 *                   - email
 *                   - token
 *               - type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     pattern: '^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$'
 *                     description: "JWT reset token"
 *                 required:
 *                   - token
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post("/verify-email-verification-token", validateRequest(verifyEmailVerificationTokenSchema), authController.verifyEmailVerificationToken);
export { router };