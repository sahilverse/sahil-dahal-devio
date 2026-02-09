import { Socket } from "socket.io";
import { JwtManager, logger } from "../../utils";
import { ReqUser } from "../auth";

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        const decoded = JwtManager.verifyAccessToken(token) as any;

        socket.data.user = {
            id: decoded.sub,
        } as Partial<ReqUser>;

        next();
    } catch (err: any) {
        logger.error(`Socket authentication failed: ${err.message}`);
        next(new Error("Authentication error: Invalid token"));
    }
};


export const compilerSocketMiddleware = (socket: Socket, next: (err?: any) => void) => {
    const sessionId = socket.handshake.query?.sessionId as string;

    if (!sessionId) {
        return next(new Error("Authentication error: No sessionId provided"));
    }
    socket.data.sessionId = sessionId;
    next();
};
