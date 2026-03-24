import { Router } from "express";
import { z } from "zod";
import { TYPES } from "../../types";
import { PaymentController } from "./payment.controller";
import { AuthMiddleware } from "../../middlewares/auth";
import { container } from "../../config/inversify";
import { validateRequest } from "../../middlewares/validation";

const router: Router = Router();
const paymentController = container.get<PaymentController>(TYPES.PaymentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

const InitiatePaymentSchema = z.object({
    packageId: z.string().min(1, "Package ID is required"),
    promoCode: z.string().optional(),
});

const ValidatePromoSchema = z.object({
    code: z.string().min(1, "Promo code is required"),
    packageId: z.string().optional(),
    courseId: z.string().optional(),
});

/**
 * @swagger
 * /payments/packages:
 *   get:
 *     summary: Get all available Cipher packages
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of active cipher packages
 */
router.get("/packages", paymentController.getPackages);

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initiate a cipher purchase via eSewa
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [packageId]
 *             properties:
 *               packageId:
 *                 type: string
 *               promoCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiation data with eSewa form config
 */
router.post("/initiate", authMiddleware.guard, validateRequest(InitiatePaymentSchema), paymentController.initiatePurchase);

/**
 * @swagger
 * /payments/verify:
 *   get:
 *     summary: Verify eSewa payment callback
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *         description: Base64 encoded payment response from eSewa
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.get("/verify", paymentController.verifyPayment);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment history list
 */
router.get("/history", authMiddleware.guard, paymentController.getPaymentHistory);

/**
 * @swagger
 * /payments/promo/validate:
 *   post:
 *     summary: Validate a promo code
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Promo code is valid
 */
router.post("/promo/validate", authMiddleware.guard, validateRequest(ValidatePromoSchema), paymentController.validatePromoCode);

export { router };
