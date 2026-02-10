import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { AuraController } from "./aura.controller";
import { AuthMiddleware } from "../../middlewares";

const auraRouter: Router = Router();

const auraController = container.get<AuraController>(TYPES.AuraController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * /aura/points:
 *   get:
 *     summary: Get current user's Aura points
 *     tags: [Aura]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User points fetched successfully
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
 *                     points:
 *                       type: integer
 */
auraRouter.get("/points", authMiddleware.guard, auraController.getPoints);

/**
 * @swagger
 * /aura/history:
 *   get:
 *     summary: Get user's Aura transaction history
 *     tags: [Aura]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Aura history fetched successfully
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
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuraTransaction'
 */
auraRouter.get("/history", authMiddleware.guard, auraController.getHistory);

export { auraRouter };
