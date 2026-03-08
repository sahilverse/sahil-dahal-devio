import 'dotenv/config';
import express from 'express';
import { InstanceController } from './controller/instance.controller';
import { DockerService } from './services/DockerService';
import { createRouter } from './routes';
import { setupSwaggerDocs } from './docs/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils';

import { WebSocketServer } from 'ws';
import { TerminalService } from './services/TerminalService';

const app = express();

const dockerService = new DockerService();
const instanceController = new InstanceController(dockerService);

app.use(express.json({ limit: '1mb' }));

// Setup routes 
app.use("/api/instances", createRouter(instanceController));

// Setup Swagger documentation at root
setupSwaggerDocs(app);

app.use(errorHandler);

const PORT = process.env.PORT || 5500;

const server = app.listen(PORT, async () => {
    try {
        await dockerService.initializeNetwork();
        logger.info(`Lab Orchestrator running on port ${PORT}`);
        logger.info(`Swagger docs available at http://localhost:${PORT}`);
    } catch (error: any) {
        logger.error(`Failed to initialize Docker Network: ${error.message}`);
    }
});

// Setup WebSocket Server for Terminal Bridge
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const instanceId = url.searchParams.get('instanceId');

    if (url.pathname === '/terminal' && instanceId) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            TerminalService.handleConnection(ws, instanceId);
        });
    } else {
        socket.destroy();
    }
});

const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
        try {
            logger.info('Server shut down completely');
        } catch (err: any) {
            logger.error(`Error during shutdown: ${err.message}`);
        }
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
