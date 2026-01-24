import type { AccountStatus, SessionType } from "../../generated/prisma/client";
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
    roleId: number | null;
    username: string | null;
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

// OAuth Types
export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export interface GitHubUserInfo {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

export interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

export interface OAuthLoginResult {
    user: AuthUserDTO;
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
}
