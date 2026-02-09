import { injectable, inject } from "inversify";
import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { TYPES } from "../../types";
import { RedisManager } from "../../config/redis";
import { logger } from "../../utils";
import { ISocketHandler } from "../socket";
import { compilerSocketMiddleware } from "../socket/socket.middleware";

@injectable()
export class CompilerSocketHandler implements ISocketHandler {
    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager
    ) { }

    public setup(io: Server, baseSubClient?: Redis): void {
        if (!baseSubClient) {
            logger.error("CompilerSocketHandler: Cannot initialize without Redis subClient");
            return;
        }

        const compilerNamespace = io.of("/compiler");
        compilerNamespace.use(compilerSocketMiddleware);

        compilerNamespace.on("connection", async (socket: Socket) => {
            const sessionId = socket.data.sessionId;
            const outputChannel = `sandbox:output:${sessionId}`;
            const commandChannel = `sandbox:command:${sessionId}`;

            logger.info(`Compiler socket connected: ${socket.id} (Session: ${sessionId})`);

            const redisSub = baseSubClient.duplicate();
            await redisSub.subscribe(outputChannel);

            redisSub.on("message", (channel: string, message: string) => {
                if (channel === outputChannel) {
                    try {
                        const data = JSON.parse(message);
                        socket.emit("output", data);
                    } catch (err: any) {
                        logger.error(`Error parsing Redis message for session ${sessionId}: ${err.message}`);
                    }
                }
            });

            redisSub.on("error", (err: any) => {
                logger.error(`Redis subscriber error for session ${sessionId}: ${err.message}`);
            });

            socket.on("input", async (input: string) => {
                try {
                    const redisPub = this.redisManager.getPub();
                    await redisPub.publish(commandChannel, JSON.stringify({
                        type: 'input',
                        data: input
                    }));
                    logger.debug(`Session ${sessionId}: Interactive input forwarded to Redis`);
                } catch (err: any) {
                    logger.error(`Error forwarding input for session ${sessionId}: ${err.message}`);
                }
            });

            socket.on("disconnect", async (reason: string) => {
                logger.warn(`Compiler socket disconnected: ${socket.id} (Session: ${sessionId}, Reason: ${reason})`);
                await redisSub.quit();
            });
        });
    }
}
