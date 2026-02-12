import { injectable } from "inversify";
import { Server } from "socket.io";
import { ISocketHandler } from "../socket/socket.types";
import { logger } from "../../utils";

@injectable()
export class ConversationSocketHandler implements ISocketHandler {
    public setup(io: Server): void {
        logger.info("Setting up Conversation socket events");

        io.on("connection", (socket) => {
            socket.on("conversation:typing", (data: { conversationId: string, recipientId: string }) => {
                const userId = socket.data.user?.id;
                if (userId) {
                    io.to(`user:${data.recipientId}`).emit("conversation:typing", {
                        conversationId: data.conversationId,
                        userId
                    });
                }
            });

            socket.on("conversation:stop_typing", (data: { conversationId: string, recipientId: string }) => {
                const userId = socket.data.user?.id;
                if (userId) {
                    io.to(`user:${data.recipientId}`).emit("conversation:stop_typing", {
                        conversationId: data.conversationId,
                        userId
                    });
                }
            });
        });
    }
}
