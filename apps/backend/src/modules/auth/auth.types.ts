import type { User, CodeType, Role } from "../../generated/prisma/client";
export interface LoginServiceResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}
export interface CreateSessionInput {
    userId: string;
    sessionToken: string;
    device?: string;
    ip?: string;
    location?: Record<string, any>;
    userAgent?: string;
    expiresAt: Date;
}
export interface CreateVerificationTokenInput {
    userId: string;
    code: string;
    type: CodeType;
    expiresAt: Date;
}

export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    username: string;
    isActive: boolean;
}