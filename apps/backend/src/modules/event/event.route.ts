import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { EventController } from "./event.controller";
import { AuthMiddleware, validateRequest, upload } from "../../middlewares";
import { createEventSchema, updateEventSchema, eventRegistrationSchema, addEventProblemSchema } from "@devio/zod-utils";

const router: Router = Router();
const eventController = container.get<EventController>(TYPES.EventController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateEventInput:
 *       type: object
 *       required: [title, description, type, startsAt, endsAt]
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [HACKATHON, CTF, CONTEST, WORKSHOP, MEETUP]
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, PUBLISHED, ONGOING, COMPLETED, CANCELLED]
 *           default: DRAFT
 *         communityId:
 *           type: string
 *         startsAt:
 *           type: string
 *           format: date-time
 *         endsAt:
 *           type: string
 *           format: date-time
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *         minAuraPoints:
 *           type: integer
 *           default: 0
 *         entryCipherCost:
 *           type: integer
 *           default: 0
 *         maxParticipants:
 *           type: integer
 *         participationAura:
 *           type: integer
 *           default: 0
 *         imageUrl:
 *           type: string
 *           format: url
 *         requiresTeam:
 *           type: boolean
 *           default: false
 *         teamSize:
 *           type: integer
 *         externalUrl:
 *           type: string
 *           format: url
 *         rules:
 *           type: array
 *           items:
 *             type: string
 *         prizes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rank:
 *                 type: integer
 *               prize:
 *                 type: string
 *               description:
 *                 type: string
 *     UpdateEventInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, PUBLISHED, ONGOING, COMPLETED, CANCELLED]
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *         rules:
 *           type: array
 *           items:
 *             type: string
 *         prizes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rank:
 *                 type: integer
 *               prize:
 *                 type: string
 *               description:
 *                 type: string
 *     EventRegistrationInput:
 *       type: object
 *       properties:
 *         teamName:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error or Title already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User not verified
 */
router.post(
    "/",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(createEventSchema),
    eventController.createEvent
);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Fetch events
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, PUBLISHED, ONGOING, COMPLETED, CANCELLED]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HACKATHON, CTF, CONTEST, WORKSHOP, MEETUP]
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE, UNLISTED]
 *     responses:
 *       200:
 *         description: Events fetched successfully
 */
router.get(
    "/",
    authMiddleware.extractUser,
    eventController.getEvents
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event fetched successfully
 *       404:
 *         description: Event not found
 */
router.get(
    "/:id",
    authMiddleware.extractUser,
    eventController.getEvent
);

/**
 * @swagger
 * /events/{id}/prizes:
 *   get:
 *     summary: Get event prizes
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prizes fetched successfully
 */
router.get(
    "/:id/prizes",
    eventController.getEventPrizes
);

/**
 * @swagger
 * /events/{id}/rules:
 *   get:
 *     summary: Get event rules
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rules fetched successfully
 */
router.get(
    "/:id/rules",
    eventController.getEventRules
);

/**
 * @swagger
 * /events/{id}/problems:
 *   get:
 *     summary: Get event problems
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Problems fetched successfully
 */
router.get(
    "/:id/problems",
    authMiddleware.extractUser,
    eventController.getEventProblems
);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventInput'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Unauthorized to update this event
 *       404:
 *         description: Event not found
 */
router.patch(
    "/:id",
    authMiddleware.guard,
    validateRequest(updateEventSchema),
    eventController.updateEvent
);

/**
 * @swagger
 * /events/{id}/register:
 *   post:
 *     summary: Register for an event
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventRegistrationInput'
 *     responses:
 *       200:
 *         description: Successfully registered for event
 *       400:
 *         description: Registration not open, Insufficient Aura/Cipher, or already registered
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/:id/register",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    validateRequest(eventRegistrationSchema),
    eventController.registerForEvent
);

/**
 * @swagger
 * /events/{id}/leaderboard:
 *   get:
 *     summary: Get event leaderboard
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaderboard fetched successfully
 *       404:
 *         description: Event not found
 */
router.get(
    "/:id/leaderboard",
    eventController.getLeaderboard
);

/**
 * @swagger
 * /events/{id}/image:
 *   post:
 *     summary: Upload event image
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Unauthorized to update this event
 *       404:
 *         description: Event not found
 */
router.post(
    "/:id/image",
    authMiddleware.guard,
    upload.single("image"),
    eventController.uploadImage
);

/**
 * @swagger
 * /events/{id}/image:
 *   delete:
 *     summary: Remove event image
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event image removed successfully
 *       403:
 *         description: Unauthorized to update this event
 *       404:
 *         description: Event not found
 */
router.delete(
    "/:id/image",
    authMiddleware.guard,
    eventController.removeImage
);

/**
 * @swagger
 * /events/{id}/problems:
 *   post:
 *     summary: Add a problem to an event
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               problemId:
 *                 type: string
 *               points:
 *                 type: integer
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Problem added successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event or Problem not found
 *       409:
 *         description: Problem already added
 */
router.post(
    "/:id/problems",
    authMiddleware.guard,
    validateRequest(addEventProblemSchema),
    eventController.addEventProblem
);

/**
 * @swagger
 * /events/{id}/problems/{problemId}:
 *   delete:
 *     summary: Remove a problem from an event
 *     tags: [Event]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Problem removed successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Event or Problem not found
 */
router.delete(
    "/:id/problems/:problemId",
    authMiddleware.guard,
    eventController.removeEventProblem
);

export { router };
