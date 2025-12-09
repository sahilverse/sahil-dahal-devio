import { AccountStatus } from "../../generated/prisma/client";

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}


export interface AccountStatusPayload {
    userId: string;
    status: AccountStatus;
    reason?: string;
    performedBy?: string;
}