import 'dotenv/config';
import express from 'express';
import { SessionController } from './controller/session.controller';
import { docker } from './config';
import { logger } from './utils';
import DockerPool from './services/DockerPool';
import { SessionManager } from './services/SessionManager';
import { ExecutionService } from './services/ExecutionService';
import { createRouter } from './routes';
import { setupSwaggerDocs } from './docs/swagger';

import { errorHandler } from './middlewares/errorHandler';

import { redis } from './config';
import { RedisStreamManager } from './services/RedisStreamManager';

const app = express();

const redisStreamManager = new RedisStreamManager(redis);

const dockerPool = new DockerPool(docker, {
    maxPoolSize: 3,
    initialPoolSize: 1,
    idleTimeout: 5 * 60 * 1000
});

const executionService = new ExecutionService(dockerPool, redisStreamManager);
const sessionManager = new SessionManager(docker, dockerPool, executionService, redisStreamManager);
const sessionController = new SessionController(sessionManager);

app.use(express.json({ limit: '1mb' }));

// Setup routes 
app.use("/api", createRouter(dockerPool, sessionController));

// Setup Swagger documentation at root
setupSwaggerDocs(app);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    await dockerPool.waitForInitialization();
    await sessionManager.initialize();
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
        try {
            sessionManager.shutdown();
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
