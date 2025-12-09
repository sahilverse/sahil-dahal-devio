import { Request } from "express";
import { ReqUser } from "../modules/auth";

declare global {
    namespace Express {
        interface Request {
            user?: ReqUser;
        }
    }
}