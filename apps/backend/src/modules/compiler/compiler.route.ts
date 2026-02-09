import { Router } from "express";
import { container } from "../../config";
import { TYPES } from "../../types";
import { CompilerController } from "./compiler.controller";
import { validateRequest } from '../../middlewares';
import { ExecutionRequestSchema } from "@devio/zod-utils";

const router: Router = Router();
const compilerController = container.get<CompilerController>(TYPES.CompilerController);

/**
 * @swagger
 * /compiler/languages:
 *   get:
 *     summary: Get supported programming languages
 *     tags: [Compiler]
 *     responses:
 *       200:
 *         description: Languages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/LanguageListDto'
 *       500:
 *         description: Internal server error
 */
router.get("/languages", compilerController.getLanguages);

/**
 * @swagger
 * /compiler/execute:
 *   post:
 *     summary: Execute code
 *     tags: [Compiler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               code:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code execution completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *                 result:
 *                   $ref: '#/components/schemas/ExecutionResultDto'
 *       400:
 *         description: Bad request (validation error)
 *       500:
 *         description: Internal server error
 */
router.post(
    "/execute",
    validateRequest(ExecutionRequestSchema),
    compilerController.executeCode
);


/**
 * @swagger
 * /compiler/{sessionId}/end:
 *   post:
 *     summary: End a session
 *     tags: [Compiler]
 *     description: Terminates a running session and cleans up resources.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       500:
 *         description: Server error
 */
router.post(
    "/:sessionId/end",
    compilerController.endSession
);

export { router };
