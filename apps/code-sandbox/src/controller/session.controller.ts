import { Request, Response } from 'express';
import { SessionManager } from '../services/SessionManager';

export class SessionController {
    constructor(private sessionManager: SessionManager) { }

    async startSession(req: Request, res: Response): Promise<void> {
        try {
            const { language } = req.body;
            if (!language) {
                res.status(400).json({ error: 'Language is required' });
                return;
            }

            const result = await this.sessionManager.startSession(language);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async executeCode(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { code } = req.body;
            if (!sessionId) {
                res.status(400).json({ error: 'Session ID is required' });
                return;
            }
            if (!code) {
                res.status(400).json({ error: 'Code is required' });
                return;
            }

            const result = await this.sessionManager.executeCode(sessionId, code);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sendInput(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { input } = req.body;
            if (!sessionId) {
                res.status(400).json({ error: 'Session ID is required' });
                return;
            }
            if (input === undefined) {
                res.status(400).json({ error: 'Input is required' });
                return;
            }

            const result = await this.sessionManager.sendInput(sessionId, input);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async endSession(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                res.status(400).json({ error: 'Session ID is required' });
                return;
            }

            await this.sessionManager.endSession(sessionId);
            res.json({ message: 'Session ended' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
