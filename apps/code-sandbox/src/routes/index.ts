import { Router, Request, Response } from "express";
import { SessionController } from "../controller/session.controller";
import DockerPool from "../services/DockerPool";
import { LANGUAGE_CONFIG } from "../config/languages";
import { validateRequest } from "../middlewares/validateRequest";
import { ResponseHandler } from "../utils/ResponseHandler";
import { StatusCodes } from "http-status-codes";

export const createRouter = (
    dockerPool: DockerPool,
    sessionController: SessionController
) => {
    const router: Router = Router();

    /**
     * @swagger
     * /pool/stats:
     *   get:
     *     summary: Get Docker pool statistics
     *     tags: [Pool]
     *     description: Returns current statistics about the Docker container pool including active containers, available containers, and pool utilization.
     *     responses:
     *       200:
     *         description: Pool statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 active:
     *                   type: integer
     *                   description: Number of containers currently in use
     *                 available:
     *                   type: integer
     *                   description: Number of containers available for use
     *                 maxPoolSize:
     *                   type: integer
     *                   description: Maximum pool size configuration
     */
    router.get("/pool/stats", (req: Request, res: Response) =>
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Pool stats retrieved", dockerPool.getPoolStats())
    );

    /**
     * @swagger
     * /session/start:
     *   post:
     *     summary: Start a new code execution session
     *     tags: [Session]
     *     description: Creates a new session and allocates a Docker container for code execution in the specified language.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - language
     *             properties:
     *               language:
     *                 type: string
     *                 enum: [python, javascript, c, cpp, java]
     *                 description: Programming language for the session
     *               sessionID:
     *                 type: string
     *                 description: custom Session ID
     *     responses:
     *       200:
     *         description: Session started successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 sessionId:
     *                   type: string
     *                   description: Unique session identifier
     *                 language:
     *                   type: string
     *                   description: The language of the session
     *       400:
     *         description: Language is required
     *       500:
     *         description: Server error
     */
    router.post(
        "/session/start",
        validateRequest,
        sessionController.startSession.bind(sessionController)
    );

    /**
     * @swagger
     * /session/{sessionId}/execute:
     *   post:
     *     summary: Execute code in a session
     *     tags: [Session]
     *     description: Executes the provided code within the specified session's Docker container.
     *     parameters:
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: Session ID from start session
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - code
     *             properties:
     *               code:
     *                 type: string
     *                 description: Code to execute
     *     responses:
     *       200:
     *         description: Code executed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 output:
     *                   type: string
     *                   description: Execution output
     *                 error:
     *                   type: string
     *                   description: Error message if any
     *                 exitCode:
     *                   type: integer
     *                   description: Process exit code
     *       400:
     *         description: Session ID or code is required
     *       500:
     *         description: Server error
     */
    router.post(
        "/session/:sessionId/execute",
        validateRequest,
        sessionController.executeCode.bind(sessionController)
    );


    /**
     * @swagger
     * /session/{sessionId}/end:
     *   post:
     *     summary: End a session
     *     tags: [Session]
     *     description: Terminates the session and releases the Docker container back to the pool.
     *     parameters:
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: Session ID to end
     *     responses:
     *       200:
     *         description: Session ended successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Session ended
     *       400:
     *         description: Session ID is required
     *       500:
     *         description: Server error
     */
    router.post(
        "/session/:sessionId/end",
        sessionController.endSession.bind(sessionController)
    );

    /**
     * @swagger
     * /session/{sessionId}/input:
     *   post:
     *     summary: Send input to a running session
     *     tags: [Session]
     *     description: Sends stdin input to a running process in the session (for interactive programs).
     *     parameters:
     *       - in: path
     *         name: sessionId
     *         required: true
     *         schema:
     *           type: string
     *         description: Session ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - input
     *             properties:
     *               input:
     *                 type: string
     *                 description: Input string to send to the running process
     *     responses:
     *       200:
     *         description: Input sent successfully
     *       400:
     *         description: Session ID or input is required
     *       500:
     *         description: Server error
     */
    router.post(
        "/session/:sessionId/input",
        validateRequest,
        sessionController.sendInput.bind(sessionController)
    );

    /**
     * @swagger
     * /languages:
     *   get:
     *     summary: Get supported languages
     *     tags: [Languages]
     *     description: Returns a list of programming languages supported by the code execution service.
     *     responses:
     *       200:
     *         description: Languages retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 languages:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: [python, javascript, c, cpp, java]
     *     */
    router.get("/languages", (req: Request, res: Response) => {
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Languages retrieved", { languages: Object.keys(LANGUAGE_CONFIG) });
    });

    return router;
};
