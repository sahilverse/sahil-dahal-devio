import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { NotificationController } from "./notification.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const controller = container.get<NotificationController>(TYPES.NotificationController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

router.use(authMiddleware.guard);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Fetch current user's notifications
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (ID of the last item)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications to fetch
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", controller.getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all current user's unread notifications as read
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch("/read-all", controller.markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read (must belong to current user)
 *     tags: [Notification]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", controller.markRead);

export { router };
