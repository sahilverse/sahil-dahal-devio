import { injectable, inject } from "inversify";
import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { TYPES } from "../../types";
import { RedisManager } from "../../config/redis";
import { logger } from "../../utils";
import { ISocketHandler } from "../socket";
import { compilerSocketMiddleware } from "../socket/socket.middleware";

import { CompilerService } from "./compiler.service";

@injectable()
export class CompilerSocketHandler implements ISocketHandler {
    private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.CompilerService) private compilerService: CompilerService
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

            const existingTimeout = this.sessionTimeouts.get(sessionId);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                this.sessionTimeouts.delete(sessionId);
                logger.info(`Session ${sessionId} reconnected. Grace period canceled.`);
            }

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

                const timeout = setTimeout(async () => {
                    try {
                        logger.info(`Session ${sessionId} grace period expired. Terminating...`);
                        await this.compilerService.endSession(sessionId);
                        this.sessionTimeouts.delete(sessionId);
                    } catch (err: any) {
                        logger.error(`Failed to end session ${sessionId} after grace period: ${err.message}`);
                    }
                }, 30000);

                this.sessionTimeouts.set(sessionId, timeout);
            });
        });
    }
}
