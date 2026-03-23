import { injectable, inject } from "inversify";
import { Server, Socket } from "socket.io";
import { TYPES } from "../../types";
import { logger } from "../../utils";
import { ISocketHandler } from "../socket";
import { socketAuthMiddleware } from "../socket/socket.middleware";
import { LabRepository } from "./lab.repository";
import { LAB_ORCHESTRATOR_URL } from "../../config/constants";

@injectable()
export class LabSocketHandler implements ISocketHandler {
    constructor(
        @inject(TYPES.LabRepository) private labRepository: LabRepository
    ) { }

    public setup(io: Server): void {
        const labNamespace = io.of("/lab");

        labNamespace.use(socketAuthMiddleware);

        labNamespace.on("connection", async (socket: Socket) => {
            const userId = socket.data.user?.id;
            const instanceId = socket.handshake.query.instanceId as string;
            const roomId = socket.handshake.query.roomId as string;

            if (!userId || !instanceId || !roomId) {
                socket.emit("output", "\r\n\x1b[31m[Connection Error: Missing parameters]\x1b[0m\r\n");
                socket.disconnect();
                return;
            }

            try {
                const activeSession = await this.labRepository.findActiveSession(userId, roomId);

                if (!activeSession || activeSession.instanceId !== instanceId) {
                    logger.warn(`Unauthorized terminal access attempt by user ${userId} for instance ${instanceId}`);
                    socket.emit("output", "\r\n\x1b[31m[Unauthorized or Expired Session]\x1b[0m\r\n");
                    socket.disconnect();
                    return;
                }

                logger.info(`Lab terminal connected: User ${userId}, Instance ${instanceId}`);

                const orchestratorWSUrl = new URL(LAB_ORCHESTRATOR_URL);
                orchestratorWSUrl.protocol = orchestratorWSUrl.protocol === "https:" ? "wss:" : "ws:";
                orchestratorWSUrl.pathname = "/terminal";
                orchestratorWSUrl.searchParams.set("instanceId", instanceId);

                const orchestratorSocket = new WebSocket(orchestratorWSUrl.toString());
                orchestratorSocket.binaryType = "arraybuffer";

                orchestratorSocket.onopen = () => {
                    socket.emit("output", "\x1b[32m[Connected to Devio Lab System]\x1b[0m\r\n");
                };

                orchestratorSocket.onmessage = (event) => {
                    socket.emit("output", event.data);
                };

                orchestratorSocket.onclose = () => {
                    socket.emit("output", "\r\n\x1b[31m[Remote VM Disconnected]\x1b[0m\r\n");
                    socket.disconnect();
                };

                orchestratorSocket.onerror = (err) => {
                    logger.error(`Lab terminal orchestrator WS error for instance ${instanceId}`);
                    socket.emit("output", "\r\n\x1b[31m[Connection Error with Lab Orchestrator]\x1b[0m\r\n");
                    socket.disconnect();
                };

                socket.on("data", (dataPayload) => {
                    if (orchestratorSocket.readyState === WebSocket.OPEN) {
                        const payload = JSON.stringify({ type: "data", data: dataPayload });
                        orchestratorSocket.send(payload);
                    }
                });

                socket.on("resize", (resizePayload) => {
                    if (orchestratorSocket.readyState === WebSocket.OPEN) {
                        const payload = JSON.stringify({ type: "resize", cols: resizePayload.cols, rows: resizePayload.rows });
                        orchestratorSocket.send(payload);
                    }
                });

                socket.on("disconnect", () => {
                    logger.info(`Lab terminal disconnected: User ${userId}, Instance ${instanceId}`);
                    if (orchestratorSocket.readyState === WebSocket.OPEN) {
                        orchestratorSocket.close();
                    }
                });

            } catch (error) {
                logger.error(error, "Error setting up lab terminal proxy:");
                socket.emit("output", "\r\n\x1b[31m[Internal Server Error during connection setup]\x1b[0m\r\n");
                socket.disconnect();
            }
        });
    }
}
