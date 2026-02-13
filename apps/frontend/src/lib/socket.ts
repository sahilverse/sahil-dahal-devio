import { io, type Socket } from "socket.io-client";
import { getAccessToken, logout } from "./auth";
import { SOCKET_URL } from "./constants";
import { refreshToken } from "@/api/refreshToken";
import {
    getRefreshingState,
    addToQueue,
    startRefreshing,
    stopRefreshing,
    processQueue,
} from "@/api/refreshQueue";
import { logger } from "./logger";

export default class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    async connect(token?: string, namespace: string = "/"): Promise<Socket> {
        const url = namespace === "/" ? SOCKET_URL : `${SOCKET_URL}${namespace}`;

        if (this.socket && this.socket.connected && (this.socket as any).nsp === namespace) {
            return this.socket;
        }

        this.socket = io(url, {
            auth: { token: token || getAccessToken() },
            withCredentials: true,
            transports: ["websocket"],
            query: namespace !== "/" ? {} : undefined
        });

        this.setupEventHandlers();
        return this.socket;
    }

    async connectWithQuery(namespace: string, query: Record<string, string>): Promise<Socket> {
        const url = `${SOCKET_URL}${namespace}`;

        if (this.socket) this.socket.disconnect();

        this.socket = io(url, {
            auth: { token: getAccessToken() },
            query,
            withCredentials: true,
            transports: ["websocket"],
            forceNew: true,
            multiplex: false,
        });

        this.setupEventHandlers();
        return this.socket;
    }

    async reconnectWithToken(): Promise<void> {
        if (!this.socket) return;
        if (this.socket.connected) this.socket.disconnect();
        await this.connect();
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            logger.info({ socketId: this.socket?.id }, "Socket connected");

        });

        this.socket.on("disconnect", (reason) => {
            logger.warn({ reason }, "Socket disconnected");
        });

        this.socket.on("connect_error", async (error: any) => {
            logger.error({ error: error?.message || error }, "Socket connection error");

            const tokenErrors = ["INVALID_TOKEN", "NO_TOKEN_PROVIDED"];
            if (!tokenErrors.includes(error?.message)) return;

            if (getRefreshingState()) {
                return new Promise<void>((resolve, reject) => {
                    addToQueue({
                        resolve: async (_newToken: string) => {
                            await this.reconnectWithToken();
                            resolve();
                        },
                        reject,
                    });
                });
            }

            if (!getRefreshingState()) {
                startRefreshing();
                try {
                    const newToken = await refreshToken();
                    await this.reconnectWithToken();
                    processQueue(null, newToken);
                } catch (err) {
                    processQueue(err, null);
                    logout();
                } finally {
                    stopRefreshing();
                }
            }
        });
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const socketInstance = SocketService.getInstance();



