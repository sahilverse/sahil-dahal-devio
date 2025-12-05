import 'dotenv/config';
import express from 'express';
import { SessionController } from './controller/session.controller';
import { docker } from './config';
import { logger } from './utils';
import DockerPool from './services/DockerPool';
import { SessionManager } from './services/SessionManager';
import { ExecutionService } from './services/ExecutionService';

const app = express();

const dockerPool = new DockerPool(docker, {
    maxPoolSize: 3,
    initialPoolSize: 1,
    idleTimeout: 5 * 60 * 1000
});

const executionService = new ExecutionService(dockerPool);
const sessionManager = new SessionManager(docker, dockerPool, executionService);
const sessionController = new SessionController(sessionManager);

app.use(express.json({ limit: '1mb' }));


app.get('/pool/stats', (req, res) => res.json(dockerPool.getPoolStats()));


app.post('/session/start', sessionController.startSession.bind(sessionController));
app.post('/session/:sessionId/execute', sessionController.executeCode.bind(sessionController));
app.post('/session/:sessionId/input', sessionController.sendInput.bind(sessionController));
app.post('/session/:sessionId/end', sessionController.endSession.bind(sessionController));

app.get('/languages', (req, res) => {
    res.json({ languages: ['python', 'javascript', 'c', 'cpp', 'java'] });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.json({
        status: 500,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    await dockerPool.waitForInitialization();
    logger.info(`Server running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
        try {
            await dockerPool.shutdown();
            logger.info('Server shut down completely');
        } catch (err: any) {
            logger.error(`Error during shutdown: ${err.message}`);
        }
        process.exit(0);
    });

};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
