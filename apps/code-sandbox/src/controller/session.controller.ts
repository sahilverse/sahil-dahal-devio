import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionManager } from '../services/SessionManager';
import { ResponseHandler } from '../utils/ResponseHandler';

export class SessionController {
    constructor(private sessionManager: SessionManager) { }

    async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { language, sessionId } = req.body;
            const result = await this.sessionManager.startSession(language, sessionId);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Session started successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async executeCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { code } = req.body;
            if (!sessionId) throw new Error("Session ID is required");
            const result = await this.sessionManager.executeCode(sessionId, code);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Code executed successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async sendInput(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { input } = req.body;
            if (!sessionId) throw new Error("Session ID is required");
            const result = await this.sessionManager.sendInput(sessionId, input);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Input sent successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sessionId } = req.params;
            if (!sessionId) throw new Error("Session ID is required");
            await this.sessionManager.endSession(sessionId);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Session ended successfully");
        } catch (error) {
            next(error);
        }
    }
}
