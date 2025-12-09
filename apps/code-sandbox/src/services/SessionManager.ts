import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionSession, SessionResponse } from '../types';
import { LANGUAGE_CONFIG } from '../config/languages';
import { logger } from '../utils/logger';
import DockerPool from './DockerPool';
import { ExecutionService, StreamData } from './ExecutionService';

export class SessionManager {
    private sessions: Map<string, ExecutionSession> = new Map();
    private sessionStreams: Map<string, StreamData> = new Map();

    constructor(private docker: Docker, private pool: DockerPool, private executionService: ExecutionService) { }

    async startSession(language: string): Promise<{ sessionId: string }> {
        const sessionId = uuidv4();
        const config = LANGUAGE_CONFIG[language];
        if (!config) throw new Error(`Unsupported language: ${language}`);

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
        if (!session) throw new Error(`Session ${sessionId} not found`);

        session.code = code;

        const container = this.docker.getContainer(session.containerId);
        const streamData = this.sessionStreams.get(sessionId);
        if (!streamData) throw new Error(`No stream data for session ${sessionId}`);

        const prevStdoutLength = streamData.stdout.length;
        const prevStderrLength = streamData.stderr.length;

        streamData.dataReceived = false;
        const startTime = Date.now();

        try {
            await this.executionService.executeCode(container, code, session.language, sessionId, streamData);

            const dataPromise = new Promise<void>((resolve) => {
                let resolved = false;
                const timeoutHandle = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        logger.debug(`Session ${sessionId} data wait timeout`);
                        resolve();
                    }
                }, 5000);

                streamData.resolveDataWait = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeoutHandle);
                        logger.debug(`Session ${sessionId} data received, resolving`);
                        resolve();
                    }
                };
            });

            await dataPromise;

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
    } async sendInput(sessionId: string, input: string): Promise<SessionResponse> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        const streamData = this.sessionStreams.get(sessionId);
        if (!streamData) throw new Error(`No stream data for session ${sessionId}`);

        if (!streamData.stream) {
            throw new Error(`No active stream for session ${sessionId}`);
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
        if (!session) throw new Error(`Session ${sessionId} not found`);

        const streamData = this.sessionStreams.get(sessionId);
        if (streamData?.stream) streamData.stream.end();

        try {
            const container = this.docker.getContainer(session.containerId);
            await this.pool.returnContainer(session.language, container);
        } catch (error: any) {
            logger.error(`Error returning container to pool for session ${sessionId}: ${error.message}`);
        }

        this.sessions.delete(sessionId);
        this.sessionStreams.delete(sessionId);
        logger.info(`Ended session ${sessionId}`);
    }
}
