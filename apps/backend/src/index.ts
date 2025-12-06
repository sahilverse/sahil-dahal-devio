import 'dotenv/config';
import "reflect-metadata";
import app from './app';
import { PORT } from './config/constants';
import { createServer } from 'http';
import { logger } from './utils';
import { prisma } from './config'
import { RedisManager } from './config';

const server = createServer(app);


async function startServer() {
    try {
        await RedisManager.init();
        await prisma.$connect();
        logger.info("Connected to the database");


        server.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
        });

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error: any) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}



async function shutdown() {
    logger.info("Shutting down...");
    try {
        server.close(async () => {
            await prisma.$disconnect();
            logger.info("Disconnected from the database");

            await RedisManager.disconnect();

            logger.info("Server closed");
            process.exit(0);
        });
    } catch (err: any) {
        logger.error("❌ Error during shutdown:", err);
        process.exit(1);
    }
}

startServer();