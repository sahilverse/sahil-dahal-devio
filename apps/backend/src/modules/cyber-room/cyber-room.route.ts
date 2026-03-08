import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CyberRoomController } from "./cyber-room.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const cyberRoomController = container.get<CyberRoomController>(TYPES.CyberRoomController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: CyberRoom
 *   description: Internal room logic for CTFs and VM sessions
 */

/**
 * @swagger
 * /cyber-rooms/{roomId}/challenges:
 *   get:
 *     summary: Get all challenges for a specific room
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the room
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 */
router.get("/:roomId/challenges", authMiddleware.guard, cyberRoomController.getChallenges);

/**
 * @swagger
 * /cyber-rooms/challenges/{challengeId}/submit:
 *   post:
 *     summary: Submit a flag for a challenge
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 description: The flag being submitted
 *     responses:
 *       200:
 *         description: Submission result
 */
router.post("/challenges/:challengeId/submit", authMiddleware.guard, cyberRoomController.submitFlag);

/**
 * @swagger
 * /cyber-rooms/session:
 *   post:
 *     summary: Start a new VM session for a room
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *     responses:
 *       201:
 *         description: VM session started
 */
router.post("/session", authMiddleware.guard, cyberRoomController.startSession);

/**
 * @swagger
 * /cyber-rooms/session/active/{roomId}:
 *   get:
 *     summary: Get the current active VM session for a room
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active session retrieved
 */
router.get("/session/active/:roomId", authMiddleware.guard, cyberRoomController.getActiveSession);

/**
 * @swagger
 * /cyber-rooms/session/{sessionId}/extend:
 *   post:
 *     summary: Extend the duration of an active VM session
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session extended
 */
router.post("/session/:sessionId/extend", authMiddleware.guard, cyberRoomController.extendSession);

/**
 * @swagger
 * /cyber-rooms/session/{sessionId}/terminate:
 *   post:
 *     summary: Terminate an active VM session
 *     tags: [CyberRoom]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session terminated
 */
router.post("/session/:sessionId/terminate", authMiddleware.guard, cyberRoomController.terminateSession);

/**
 * @swagger
 * /cyber-rooms/webhook/minio:
 *   post:
 *     summary: Webhook for MinIO lab room structure events
 *     tags: [CyberRoom]
 *     description: This endpoint is called by MinIO when an object is created in the devio-labs bucket. It triggers automated room and challenge synchronization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EventName:
 *                 type: string
 *               Records:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook/minio", cyberRoomController.handleMinioWebhook);

export { router };
