import "dotenv/config";
import { createTranscodeWorker } from "./worker";
import { logger } from "./utils/logger";

async function main() {
    try {
        const worker = createTranscodeWorker();
        logger.info("Transcoder microservice started successfully");

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received, shutting down...`);
            try {
                await worker.close();
                logger.info("Worker closed");
                process.exit(0);
            } catch (err: any) {
                logger.error(`Error during shutdown: ${err.message}`);
                process.exit(1);
            }
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error: any) {
        logger.error(`Failed to start transcoder: ${error.message}`);
        process.exit(1);
    }
}

main();
