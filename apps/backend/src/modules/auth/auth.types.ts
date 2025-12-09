import { Session } from "inspector";
import type { CodeType, Role, AccountStatus, SessionType } from "../../generated/prisma/client";
import type { AuthUserDTO } from "./auth.dto";
export interface LoginServiceResponse {
    user: AuthUserDTO;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenServiceResponse extends LoginServiceResponse { }
export interface CreateSessionPayload {
    userId: string;
    sessionToken: string;
    ip: string | null;
    userAgent: UserAgentInfo;
    expiresAt: Date;
    type?: SessionType;
}

export interface ReqUser {
    id: string;
    email: string;
    role: Role;
    username: string;
    accountStatus: AccountStatus
    emailVerified: Date | null;
}

export interface UserAgentInfo {
    browser: string | null;
    version: string | null;
    os: string | null;
    device: string | null;
    raw: string | null;
}


export interface UploadSessionPayload {
    oldToken: string;
    newToken: string;
    ip: string | null;
    userAgent: UserAgentInfo;
    expiresAt: Date;
}


