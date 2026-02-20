import { Router } from "express";
import { SubmissionController } from "./submission.controller";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { AuthMiddleware, validateQuery, validateRequest, EventGuard } from "../../middlewares";
import { RunSubmissionSchema, SubmitSubmissionSchema, GetSubmissionsSchema, EventSubmitSubmissionSchema } from "@devio/zod-utils";

const router: Router = Router();
const controller = container.get<SubmissionController>(TYPES.SubmissionController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const eventGuard = container.get<EventGuard>(TYPES.EventGuard);

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Real-time code execution and grading engine
 */

/**
 * @swagger
 * /submissions/run:
 *   post:
 *     summary: Run code against sample test cases
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     description: Executes the student's code against a problem's sample test cases using the Judge0 engine.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug, code, language]
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug of the problem
 *               code:
 *                 type: string
 *                 description: The user's code to execute
 *               language:
 *                 type: string
 *                 description: Programming language (e.g., 'python')
 *     responses:
 *       200:
 *         description: Execution completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       token:
 *                         type: string
 *                       status:
 *                         type: string
 *                       statusId:
 *                         type: integer
 *                       stdout:
 *                         type: string
 *                       stderr:
 *                         type: string
 *                       compileOutput:
 *                         type: string
 *                       message:
 *                         type: string
 *                       time:
 *                         type: string
 *                       memory:
 *                         type: integer
 */
router.post("/run", authMiddleware.guard, validateRequest(RunSubmissionSchema), controller.run);

/**
 * @swagger
 * /submissions/submit:
 *   post:
 *     summary: Submit a solution for grading
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     description: Submits code for full grading against all test cases. Persists the result and updates user/event stats.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug, code, language]
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug of the problem
 *               code:
 *                 type: string
 *                 description: The user's code to submit
 *               language:
 *                 type: string
 *                 description: Programming language (e.g., 'python')
 *               eventId:
 *                 type: string
 *                 description: Optional ID of the event this submission belongs to
 *     responses:
 *       200:
 *         description: Submission processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 submission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     score:
 *                       type: integer
 *                     runtime:
 *                       type: integer
 *                     memory:
 *                       type: integer
 *                     error:
 *                       type: string
 */
router.post("/submit", authMiddleware.guard, authMiddleware.verifiedOnly, validateRequest(SubmitSubmissionSchema), controller.submit);

/**
 * @swagger
 * /submissions/{slug}:
 *   get:
 *     summary: List user submissions for a problem
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Submissions retrieved
 */
router.get("/:slug", authMiddleware.guard, validateQuery(GetSubmissionsSchema), controller.list);

/**
 * @swagger
 * /submissions/events/{id}/problems/{slug}/submit:
 *   post:
 *     summary: Submit a solution for an event/contest
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     description: Submit code for a specific contest problem. Enforces registration and contest timing. No general bounties awarded.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *       - in: path
 *         name: slug
 *         required: true
 *         description: Problem slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, language]
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event submission processed
 */
router.post(
    "/events/:id/problems/:slug/submit",
    authMiddleware.guard,
    authMiddleware.verifiedOnly,
    eventGuard.participantOnly,
    eventGuard.ongoingOnly,
    validateRequest(EventSubmitSubmissionSchema),
    controller.submitToEvent
);

export default router;
