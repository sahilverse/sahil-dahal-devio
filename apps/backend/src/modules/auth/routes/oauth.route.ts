import { Router } from "express";
import { container } from "../../../config";
import { TYPES } from "../../../types";
import { OAuthController } from "../controllers/oauth.controller";

const router: Router = Router();
const oauthController = container.get<OAuthController>(TYPES.OAuthController);

/**
 * @swagger
 * /oauth/google/callback:
 *   post:
 *     summary: Handle Google OAuth callback
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Google OAuth
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 access_token:
 *                   type: string
 *                 is_new_user:
 *                   type: boolean
 *       400:
 *         description: Bad request (missing code or invalid code)
 *       500:
 *         description: Internal server error
 */
router.post("/google/callback", oauthController.googleCallback);

/**
 * @swagger
 * /oauth/github/callback:
 *   post:
 *     summary: Handle GitHub OAuth callback
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from GitHub OAuth
 *     responses:
 *       200:
 *         description: GitHub authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 access_token:
 *                   type: string
 *                 is_new_user:
 *                   type: boolean
 *       400:
 *         description: Bad request (missing code or invalid code)
 *       500:
 *         description: Internal server error
 */
router.post("/github/callback", oauthController.githubCallback);

export { router };