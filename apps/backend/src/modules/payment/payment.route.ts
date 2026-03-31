import { Router } from "express";
import { TYPES } from "../../types";
import { PaymentController } from "./payment.controller";
import { AuthMiddleware } from "../../middlewares/auth";
import { container } from "../../config/inversify";
import { validateRequest } from "../../middlewares/validation";
import { InitiateCipherPaymentSchema, InitiateCoursePaymentSchema } from "@devio/zod-utils";

const router: Router = Router();
const paymentController = container.get<PaymentController>(TYPES.PaymentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);


/**
 * @swagger
 * /payments/providers:
 *   get:
 *     summary: Get supported payment providers
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of supported payment providers
 */
router.get("/providers", paymentController.getProviders);

/**
 * @swagger
 * /payments/initiate/cipher:
 *   post:
 *     summary: Initiate a cipher package purchase
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [packageId, provider]
 *             properties:
 *               packageId:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [ESEWA, KHALTI]
 *               promoCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiation data with gateway config
 */
router.post("/initiate/cipher", authMiddleware.guard, validateRequest(InitiateCipherPaymentSchema), paymentController.initiateCipherPurchase);

/**
 * @swagger
 * /payments/initiate/course:
 *   post:
 *     summary: Initiate a course purchase (supports optional elective cipher discount)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, provider]
 *             properties:
 *               courseId:
 *                 type: string
 *               provider:
 *                 type: string
 *                 enum: [ESEWA, KHALTI]
 *               promoCode:
 *                 type: string
 *               cipherAmount:
 *                 type: integer
 *                 description: Amount of ciphers to spend for discount
 *     responses:
 *       200:
 *         description: Payment initiation data (or direct enrollment if fully covered)
 */
router.post("/initiate/course", authMiddleware.guard, validateRequest(InitiateCoursePaymentSchema), paymentController.initiateCoursePurchase);

/**
 * @swagger
 * /payments/verify/esewa:
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
router.get("/verify/esewa", authMiddleware.guard, paymentController.verifyEsewa);

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
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (ID of the last item)
 *     responses:
 *       200:
 *         description: Payment history list
 */
router.get("/history", authMiddleware.guard, paymentController.getPaymentHistory);

export { router };
