import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { ConversationController } from "./conversation.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { upload } from "../../middlewares/upload.middleware";
import { startConversationSchema, sendMessageSchema } from "@devio/zod-utils";

const router: Router = Router();
const conversationController = container.get<ConversationController>(TYPES.ConversationController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Conversation
 *   description: Real-time messaging and invite system
 */

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Start a new conversation
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, message]
 *             properties:
 *               recipientId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation started
 *       409:
 *         description: Invite already pending
 */
router.post(
    "/",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(startConversationSchema),
    conversationController.startConversation
);

/**
 * @swagger
 * /conversations/search:
 *   get:
 *     summary: Search conversations by username
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Username query string
 *     responses:
 *       200:
 *         description: List of matching conversations
 */
router.get(
    "/search",
    authMiddleware.guard,
    conversationController.searchConversations
);

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get conversation list
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get(
    "/",
    authMiddleware.guard,
    conversationController.getInteractions
);

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
    "/:conversationId/messages",
    authMiddleware.guard,
    conversationController.getMessages
);

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
    "/:conversationId/messages",
    authMiddleware.guard,
    upload.array("media", 10),
    validateRequest(sendMessageSchema),
    conversationController.sendMessage
);

/**
 * @swagger
 * /conversations/messages/{messageId}:
 *   patch:
 *     summary: Edit a message
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 */
router.patch(
    "/messages/:messageId",
    authMiddleware.guard,
    conversationController.editMessage
);

/**
 * @swagger
 * /conversations/messages/{messageId}:
 *   delete:
 *     summary: Delete or unsend a message
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [me, everyone]
 *           default: me
 *         description: "Mode 'me' hides for self, 'everyone' unsends for all"
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete(
    "/messages/:messageId",
    authMiddleware.guard,
    conversationController.deleteMessage
);

/**
 * @swagger
 * /conversations/{conversationId}:
 *   delete:
 *     summary: Delete conversation (clear history)
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation history cleared
 */
router.delete(
    "/:conversationId",
    authMiddleware.guard,
    conversationController.deleteConversation
);

/**
 * @swagger
 * /conversations/{conversationId}/accept:
 *   post:
 *     summary: Accept a conversation invite
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite accepted
 */
router.post(
    "/:conversationId/accept",
    authMiddleware.guard,
    conversationController.acceptInvite
);

/**
 * @swagger
 * /conversations/{conversationId}/decline:
 *   post:
 *     summary: Decline a conversation invite
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite declined
 */
router.post(
    "/:conversationId/decline",
    authMiddleware.guard,
    conversationController.declineInvite
);

/**
 * @swagger
 * /conversations/{conversationId}/seen:
 *   post:
 *     summary: Mark messages as seen
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as seen
 */
router.post(
    "/:conversationId/seen",
    authMiddleware.guard,
    conversationController.markAsSeen
);

export { router };
