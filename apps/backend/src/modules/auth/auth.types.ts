import type { User } from "../../generated/prisma/client";
export interface LoginServiceResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}