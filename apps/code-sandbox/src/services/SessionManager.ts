import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { ExecutionSession, SessionResponse } from '../types';
import { LANGUAGE_CONFIG } from '../config/languages';
import { logger } from '../utils/logger';
import DockerPool from './DockerPool';
import { ExecutionService, StreamData } from './ExecutionService';
import { ApiError } from '../utils/ApiError';

const SESSION_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export class SessionManager {
    private sessions: Map<string, ExecutionSession> = new Map();
    private sessionStreams: Map<string, StreamData> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor(private docker: Docker, private pool: DockerPool, private executionService: ExecutionService) {
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 30 * 1000);
    }

    private async cleanupInactiveSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivityTime > SESSION_INACTIVITY_TIMEOUT_MS) {
                logger.info(`Session ${sessionId} timed out due to inactivity`);
                await this.endSession(sessionId);
            }
        }
    }

    async startSession(language: string): Promise<{ sessionId: string }> {
        const sessionId = uuidv4();
        const config = LANGUAGE_CONFIG[language];
        if (!config) throw new ApiError(`Unsupported language: ${language}`, StatusCodes.BAD_REQUEST);

        const container = await this.pool.getContainer(language);
        const now = Date.now();
        const session: ExecutionSession = {
            id: sessionId,
            language,
            code: '',
            containerId: container.id,
            startTime: now,
            lastActivityTime: now,
            isActive: true
        };

        this.sessions.set(sessionId, session);
        this.sessionStreams.set(sessionId, { stdout: '', stderr: '' });
        logger.info(`Started session ${sessionId} for ${language}`);

        return { sessionId };
    }

    async executeCode(sessionId: string, code: string): Promise<SessionResponse> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new ApiError(`Session not found`, StatusCodes.NOT_FOUND);

        session.lastActivityTime = Date.now();
        session.code = code;

        const container = this.docker.getContainer(session.containerId);
        const streamData = this.sessionStreams.get(sessionId);
        if (!streamData) throw new ApiError(`No stream data for session ${sessionId}`, StatusCodes.INTERNAL_SERVER_ERROR);

        const prevStdoutLength = streamData.stdout.length;
        const prevStderrLength = streamData.stderr.length;

        streamData.dataReceived = false;
        const startTime = Date.now();

        try {
            await this.executionService.executeCode(container, code, session.language, sessionId, streamData);

            await new Promise<void>((resolve) => {
                let resolved = false;

                // Max timeout 5s
                const maxTimeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        logger.debug(`Session ${sessionId} data wait timeout (5s)`);
                        resolve();
                    }
                }, 5000);

                // Initial fast check 500ms
                const quickCheck = setTimeout(() => {
                    if (!resolved && (streamData.dataReceived || streamData.stderr)) {
                        resolved = true;
                        clearTimeout(maxTimeout);
                        resolve();
                    }
                }, 500);

                streamData.resolveDataWait = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(maxTimeout);
                        clearTimeout(quickCheck);
                        resolve();
                    }
                };
            });

            const newStdout = streamData.stdout.substring(prevStdoutLength);
            const newStderr = streamData.stderr.substring(prevStderrLength);

            return {
                sessionId,
                stdout: newStdout,
                stderr: newStderr,
                executionTime: Date.now() - startTime
            };
        } catch (error: any) {
            logger.error(`Error in executeCode for session ${sessionId}: ${error.message}`);
            return {
                sessionId,
                stdout: '',
                stderr: error.message,
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    async sendInput(sessionId: string, input: string): Promise<SessionResponse> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new ApiError(`Session ${sessionId} not found`, StatusCodes.NOT_FOUND);

        const streamData = this.sessionStreams.get(sessionId);
        if (!streamData) throw new ApiError(`No stream data for session ${sessionId}`, StatusCodes.INTERNAL_SERVER_ERROR);

        if (!streamData.stream) {
            throw new ApiError(`No active process for session ${sessionId}`, StatusCodes.BAD_REQUEST);
        }

        session.lastActivityTime = Date.now();
        const startTime = Date.now();

        try {
            const prevStdoutLength = streamData.stdout.length;
            const prevStderrLength = streamData.stderr.length;

            await this.executionService.sendInput(streamData.stream, input);

            await new Promise(resolve => setTimeout(resolve, 500));

            const newStdout = streamData.stdout.substring(prevStdoutLength);
            const newStderr = streamData.stderr.substring(prevStderrLength);

            return {
                sessionId,
                stdout: newStdout,
                stderr: newStderr,
                executionTime: Date.now() - startTime
            };

        } catch (error: any) {
            logger.error(`Error in sendInput for session ${sessionId}: ${error.message}`);
            return {
                sessionId,
                stdout: '',
                stderr: error.message,
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    async endSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }

        const streamData = this.sessionStreams.get(sessionId);
        if (streamData?.stream) streamData.stream.end();

        try {
            const container = this.docker.getContainer(session.containerId);
            await this.pool.returnContainer(session.language, container);
        } catch (error: any) {
            logger.warn(`Error returning container to pool for session ${sessionId}: ${error.message}`);
        }

        this.sessions.delete(sessionId);
        this.sessionStreams.delete(sessionId);
        logger.info(`Ended session ${sessionId}`);
    }

    shutdown(): void {
        clearInterval(this.cleanupInterval);
        logger.info('SessionManager shutdown: cleanup interval cleared');
    }
}
