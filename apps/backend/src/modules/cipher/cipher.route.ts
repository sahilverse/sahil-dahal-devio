import { Router } from "express";
import { TYPES } from "../../types";
import { CipherController } from "./cipher.controller";
import { AuthMiddleware } from "../../middlewares/auth";
import { container } from "../../config/inversify";

const router: Router = Router();
const cipherController = container.get<CipherController>(TYPES.CipherController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);


/**
 * @swagger
 * /cipher/balance:
 *   get:
 *     summary: Get current Cipher Coin balance
 *     tags: [Cipher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 */
router.get("/balance", authMiddleware.guard, cipherController.getBalance);

/**
 * @swagger
 * /cipher/history:
 *   get:
 *     summary: Get Cipher transaction history
 *     tags: [Cipher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Transaction list
 */
router.get("/history", authMiddleware.guard, cipherController.getHistory);


export { router };
