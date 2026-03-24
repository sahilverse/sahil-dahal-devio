import { Router } from "express";
import { z } from "zod";
import { TYPES } from "../../types";
import { PaymentController } from "./payment.controller";
import { AuthMiddleware } from "../../middlewares/auth";
import { container } from "../../config/inversify";
import { validateRequest } from "../../middlewares/validation";
import { InitiatePaymentSchema } from "@devio/zod-utils";

const router: Router = Router();
const paymentController = container.get<PaymentController>(TYPES.PaymentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);


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
router.get("/verify", authMiddleware.guard, paymentController.verifyPayment);

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
