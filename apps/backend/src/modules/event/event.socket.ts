import { injectable } from "inversify";
import { Server, Socket } from "socket.io";
import { Redis } from "ioredis";
import { logger } from "../../utils";
import { ISocketHandler } from "../socket";

@injectable()
export class EventSocketHandler implements ISocketHandler {
    public setup(io: Server, subClient?: Redis): void {
        const eventNamespace = io.of("/events");

        // Note: No auth middleware applied here as per user request

        eventNamespace.on("connection", (socket: Socket) => {
            logger.info(`Event socket connected: ${socket.id}`);

            socket.on("join_event", (eventId: string) => {
                if (!eventId) return;
                socket.join(`event:${eventId}`);
                logger.debug(`Socket ${socket.id} joined event room: event:${eventId}`);
            });

            socket.on("leave_event", (eventId: string) => {
                if (!eventId) return;
                socket.leave(`event:${eventId}`);
                logger.debug(`Socket ${socket.id} left event room: event:${eventId}`);
            });

            socket.on("disconnect", (reason: string) => {
                logger.info(`Event socket disconnected: ${socket.id} (Reason: ${reason})`);
            });
        });
    }
}
