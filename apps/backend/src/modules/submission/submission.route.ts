import { Router } from "express";
import { SubmissionController } from "./submission.controller";
import { container } from "../../config/inversify";
import { TYPES } from "../../types";
import { AuthMiddleware } from "../../middlewares";

const router: Router = Router();
const controller = container.get<SubmissionController>(TYPES.SubmissionController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

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
 *       - bearerAuth: []
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
router.post("/run", authMiddleware.guard, controller.run);

export default router;
