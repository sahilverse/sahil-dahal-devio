import { Server } from "socket.io";
import { Redis } from "ioredis";

export interface ISocketHandler {
    setup(io: Server, subClient?: Redis): void;
}
