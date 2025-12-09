import 'dotenv/config';
import "reflect-metadata";
import app from './app';
import { PORT } from './config/constants';
import { createServer } from 'http';
import { logger } from './utils';
import { container } from './config';
import { TYPES } from './types';
import { RedisManager } from './config';
import { PrismaClient } from './generated/prisma/client';
import { EmailWorkerService } from './queue';

const server = createServer(app);
const redisManager = container.get<RedisManager>(TYPES.RedisManager);
const prismaClient = container.get<PrismaClient>(TYPES.PrismaClient);
const emailWorkerService = container.get<EmailWorkerService>(TYPES.EmailWorkerService);

async function startServer() {
    try {
        await redisManager.init();

        await prismaClient.$connect();
        logger.info("Connected to the database");


        server.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        await emailWorkerService.registerAllWorkers();
        logger.info("All workers registered");

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error: any) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

async function shutdown() {
    logger.info("Shutting down...");
    try {
        await prismaClient.$disconnect();
        logger.info("Disconnected from the database");

        await redisManager.disconnect();

        server.close(async () => {
            logger.info("Server closed");
            process.exit(0);
        });
    } catch (err: any) {
        logger.error("❌ Error during shutdown:", err);
        process.exit(1);
    }
}

startServer();