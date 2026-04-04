import { Router } from "express";
import { z } from "zod";
import { TYPES } from "../../types";
import { PromoCodeController } from "./promo-code.controller";
import { AuthMiddleware } from "../../middlewares/auth";
import { container } from "../../config/inversify";
import { validateRequest } from "../../middlewares/validation";
import { ValidatePromoSchema } from "@devio/zod-utils";

const router: Router = Router();
const promoCodeController = container.get<PromoCodeController>(TYPES.PromoCodeController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);



/**
 * @swagger
 * tags:
 *   name: PromoCodes
 *   description: Promo code management and validation
 */

/**
 * @swagger
 * /promo-codes/validate:
 *   post:
 *     summary: Validate a promo code
 *     tags: [PromoCodes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *               packageId:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Promo code is valid
 */
router.post("/validate", authMiddleware.guard, validateRequest(ValidatePromoSchema), promoCodeController.validatePromoCode);

export { router };
