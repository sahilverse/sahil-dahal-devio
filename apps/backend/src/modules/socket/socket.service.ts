import { injectable, inject, multiInject } from "inversify";
import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { TYPES } from "../../types";
import { RedisManager } from "../../config/redis";
import { CLIENT_URL } from "../../config/constants";
import { logger } from "../../utils";
import { socketAuthMiddleware } from "./socket.middleware";
import { ISocketHandler } from "./socket.types";

@injectable()
export class SocketService {
    private _io: Server | null = null;
    private redisSubClient: Redis | null = null;

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @multiInject(TYPES.SocketHandler) private handlers: ISocketHandler[]
    ) { }

    public init(httpServer: any): void {
        if (this._io) {
            logger.warn("Socket.IO is already initialized");
            return;
        }

        const pubClient = this.redisManager.getPub();
        const subClient = this.redisManager.getSub();
        this.redisSubClient = subClient.duplicate();

        this._io = new Server(httpServer, {
            cors: {
                origin: CLIENT_URL,
                credentials: true,
            },
            adapter: createAdapter(pubClient, subClient),
            transports: ["websocket"],
        });

        this.setupMiddleware();
        this.setupEvents();

        logger.info(`Socket.IO initialized with ${this.handlers.length} handlers`);
    }

    public get io(): Server {
        if (!this._io) {
            throw new Error("Socket.IO is not initialized. Call init() first.");
        }
        return this._io;
    }

    private setupMiddleware(): void {
        this.io.use(socketAuthMiddleware);
    }

    private setupEvents(): void {
        const io = this.io;

        io.on("connection", (socket: Socket) => {
            const userId = socket.data.user?.id;
            logger.info(`Socket connected: ${socket.id} (User ID: ${userId})`);

            if (userId) {
                socket.join(`user:${userId}`);
            }

            socket.on("disconnect", (reason) => {
                logger.warn(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
            });
        });

        this.handlers.forEach(handler => {
            handler.setup(io, this.redisSubClient || undefined);
        });
    }
}
