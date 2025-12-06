import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { AuthController } from "./auth.controller";
import { validateRequest } from '../../middlewares';
import { registerSchema, loginSchema } from "@devio/zod-utils";

const router: Router = Router();
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
 * /auth/logout:
 *   post:
 *    summary: Logout a user
 *    tags: [Auth]
 *    security:
 *      - BearerAuth: []
 *    responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authController.logout);

export { router };