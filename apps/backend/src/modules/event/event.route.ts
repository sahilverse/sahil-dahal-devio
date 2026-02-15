import { Router } from "express";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { EventController } from "./event.controller";
import { AuthMiddleware, validateRequest } from "../../middlewares";
import { createEventSchema, updateEventSchema, eventRegistrationSchema } from "@devio/zod-utils";

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
 *         communityId:
 *           type: string
 *         startsAt:
 *           type: string
 *           format: date-time
 *         endsAt:
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

export { router };
