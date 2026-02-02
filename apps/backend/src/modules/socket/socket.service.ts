import { injectable, inject } from "inversify";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { TYPES } from "../../types";
import { RedisManager } from "../../config/redis";
import { CLIENT_URL } from "../../config/constants";
import { JwtManager, logger } from "../../utils";
import { ReqUser } from "../auth";
import { socketAuthMiddleware } from "./socket.middleware";

@injectable()
export class SocketService {
    private _io: Server | null = null;

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager
    ) { }

    public init(httpServer: any): void {
        if (this._io) {
            logger.warn("Socket.IO is already initialized");
            return;
        }

        const pubClient = this.redisManager.getPub();
        const subClient = this.redisManager.getSub();

        this._io = new Server(httpServer, {
            cors: {
                origin: CLIENT_URL,
                credentials: true,
            },
            adapter: createAdapter(pubClient, subClient),
            transports: ["websocket", "polling"],
        });

        this.setupMiddleware();
        this.setupEvents();

        logger.info("Socket.IO initialized with Redis adapter");
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
        this.io.on("connection", (socket: Socket) => {
            const userId = socket.data.user?.id;
            logger.info(`Socket connected: ${socket.id} (User ID: ${userId})`);

            if (userId) {
                socket.join(`user:${userId}`);
            }

            socket.on("disconnect", (reason) => {
                logger.warn(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
            });
        });
    }
}
