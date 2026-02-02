import { ReqUser } from "../modules/auth";
import "socket.io";

declare module "socket.io" {
    interface Socket {
        data: {
            user?: Partial<ReqUser>;
        }
    }
}