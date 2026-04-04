import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { LabController } from "./lab.controller";
import { AuthMiddleware } from "../../middlewares/auth";

const router: Router = Router();
const labController = container.get<LabController>(TYPES.LabController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Laboratory and learning rooms management
 */

/**
 * @swagger
 * /labs:
 *   get:
 *     summary: Get all rooms (paginated)
 *     tags: [Lab]
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rooms retrieved
 */
router.get("/", labController.getRooms);

/**
 * @swagger
 * /labs/{slug}:
 *   get:
 *     summary: Get room details by slug
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 */
router.get("/:slug", labController.getRoomBySlug);

/**
 * @swagger
 * /labs/join:
 *   post:
 *     summary: Enroll in a lab room
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
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
 *         description: Enrolled successfully
 */
router.post("/join", authMiddleware.guard, labController.joinRoom);

/**
 * @swagger
 * /labs/enrollment/{roomId}:
 *   get:
 *     summary: Get enrollment status for a room
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment status
 */
router.get("/enrollment/:roomId", authMiddleware.guard, labController.getEnrollment);

/**
 * @swagger
 * /labs/{roomId}/challenges:
 *   get:
 *     summary: Get all challenges for a specific room
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 */
router.get("/:roomId/challenges", authMiddleware.guard, labController.getChallenges);

/**
 * @swagger
 * /labs/challenges/{challengeId}/submit:
 *   post:
 *     summary: Submit a flag for a challenge
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission result
 */
router.post("/challenges/:challengeId/submit", authMiddleware.guard, labController.submitFlag);

/**
 * @swagger
 * /labs/session:
 *   post:
 *     summary: Start a new VM session for a room
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
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
router.post("/session", authMiddleware.guard, labController.startSession);

/**
 * @swagger
 * /labs/session/active/{roomId}:
 *   get:
 *     summary: Get the current active VM session for a room
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
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
router.get("/session/active/:roomId", authMiddleware.guard, labController.getActiveSession);

/**
 * @swagger
 * /labs/session/{sessionId}/extend:
 *   post:
 *     summary: Extend the duration of an active VM session
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
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
router.post("/session/:sessionId/extend", authMiddleware.guard, labController.extendSession);

/**
 * @swagger
 * /labs/session/{sessionId}/terminate:
 *   post:
 *     summary: Terminate an active VM session
 *     tags: [Lab]
 *     security:
 *       - BearerAuth: []
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
router.post("/session/:sessionId/terminate", authMiddleware.guard, labController.terminateSession);

/**
 * @swagger
 * /labs/webhook/minio:
 *   post:
 *     summary: Webhook for MinIO lab room structure events
 *     tags: [Lab]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook/minio", labController.handleMinioWebhook);

export { router };
