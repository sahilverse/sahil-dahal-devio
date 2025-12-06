import { Request } from "express";
import { AuthUser } from "../modules/auth";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}