import { injectable, inject } from "inversify";
import { TYPES } from "../../../types";
import type { TokenService } from "./token.service";
import { AuthRepository } from "../auth.repository";
import { UserRepository, CreateOAuthUserPayload, CreateAccountPayload } from "../../user";
import { ProviderType, AccountStatus } from "../../../generated/prisma/client";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI
} from "../../../config/constants";
import { ApiError, JwtManager } from "../../../utils";
import { StatusCodes } from "http-status-codes";
import type {
    UserAgentInfo,
    CreateSessionPayload,
    GoogleUserInfo,
    GitHubUserInfo,
    GitHubEmail,
    OAuthLoginResult
} from "../auth.types";
import { toAuthUserDTO } from "../auth.dto";

@injectable()
export class OAuthService {
    constructor(
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
    ) { }

    async exchangeGoogleCode(code: string): Promise<{ accessToken: string; idToken: string }> {
        const tokenUrl = "https://oauth2.googleapis.com/token";

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(
                error.error_description || "Failed to exchange Google code",
                StatusCodes.BAD_REQUEST
            );
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            idToken: data.id_token,
        };
    }

    async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            throw new ApiError("Failed to fetch Google user info", StatusCodes.BAD_REQUEST);
        }

        return response.json();
    }

    async handleGoogleOAuth(
        code: string,
        clientIp: string,
        userAgent: UserAgentInfo
    ): Promise<OAuthLoginResult> {
        const { accessToken: googleAccessToken, idToken } = await this.exchangeGoogleCode(code);
        const googleUser = await this.getGoogleUserInfo(googleAccessToken);

        if (!googleUser.verified_email) {
            throw new ApiError("Google email is not verified", StatusCodes.BAD_REQUEST);
        }

        const { user, isNewUser } = await this.findOrCreateOAuthUser(
            ProviderType.GOOGLE,
            googleUser.id,
            googleUser.email,
            {
                firstName: googleUser.given_name || null,
                lastName: googleUser.family_name || null,
                avatarUrl: googleUser.picture || null,
            },
            idToken
        );

        const { accessToken, refreshToken } = await this.createSessionAndTokens(
            user.id,
            clientIp,
            userAgent
        );

        return {
            user: toAuthUserDTO(user),
            accessToken,
            refreshToken,
            isNewUser,
        };
    }

    async exchangeGithubCode(code: string): Promise<string> {
        const tokenUrl = "https://github.com/login/oauth/access_token";

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                code,
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                redirect_uri: GITHUB_REDIRECT_URI,
            }),
        });

        if (!response.ok) {
            throw new ApiError("Failed to exchange GitHub code", StatusCodes.BAD_REQUEST);
        }

        const data = await response.json();

        if (data.error) {
            throw new ApiError(
                data.error_description || "GitHub OAuth error",
                StatusCodes.BAD_REQUEST
            );
        }

        return data.access_token;
    }

    async getGithubUserInfo(accessToken: string): Promise<GitHubUserInfo> {
        const response = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to fetch GitHub user info", StatusCodes.BAD_REQUEST);
        }

        return response.json();
    }

    async getGithubUserEmail(accessToken: string): Promise<string> {
        const response = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to fetch GitHub user emails", StatusCodes.BAD_REQUEST);
        }

        const emails: GitHubEmail[] = await response.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);

        if (!primaryEmail) {
            throw new ApiError(
                "No verified primary email found on GitHub account",
                StatusCodes.BAD_REQUEST
            );
        }

        return primaryEmail.email;
    }

    async handleGithubOAuth(
        code: string,
        clientIp: string,
        userAgent: UserAgentInfo
    ): Promise<OAuthLoginResult> {
        const githubAccessToken = await this.exchangeGithubCode(code);
        const githubUser = await this.getGithubUserInfo(githubAccessToken);

        const email = githubUser.email || (await this.getGithubUserEmail(githubAccessToken));

        const nameParts = (githubUser.name || "").split(" ");
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(" ") || null;

        const { user, isNewUser } = await this.findOrCreateOAuthUser(
            ProviderType.GITHUB,
            githubUser.id.toString(),
            email,
            {
                firstName,
                lastName,
                avatarUrl: githubUser.avatar_url || null,
            },
            null
        );

        const { accessToken, refreshToken } = await this.createSessionAndTokens(
            user.id,
            clientIp,
            userAgent
        );

        return {
            user: toAuthUserDTO(user),
            accessToken,
            refreshToken,
            isNewUser,
        };
    }

    private async findOrCreateOAuthUser(
        provider: ProviderType,
        providerAccountId: string,
        email: string,
        userData: { firstName: string | null; lastName: string | null; avatarUrl: string | null },
        idToken: string | null
    ): Promise<{ user: any; isNewUser: boolean }> {
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            if (
                existingUser.accountStatus === AccountStatus.ADMIN_DISABLED ||
                existingUser.accountStatus === AccountStatus.SUSPENDED
            ) {
                throw new ApiError(
                    { account: "Your account is disabled or suspended. Please contact support." },
                    StatusCodes.FORBIDDEN
                );
            }

            if (
                existingUser.accountStatus === AccountStatus.DEACTIVATED ||
                existingUser.accountStatus === AccountStatus.PENDING_DELETION
            ) {
                throw new ApiError(
                    { account: "Account is deactivated. Please reactivate to continue." },
                    StatusCodes.FORBIDDEN
                );
            }

            try {
                const accountPayload: CreateAccountPayload = {
                    userId: existingUser.id,
                    provider,
                    providerAccountId,
                    id_token: idToken,
                };
                await this.userRepository.createUserOAuthAccount(accountPayload);
            } catch {
            }

            return { user: existingUser, isNewUser: false };
        }

        const oauthPayload: CreateOAuthUserPayload = {
            email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: null,
            avatarUrl: userData.avatarUrl,
            userId: "", 
            provider,
            providerAccountId,
            id_token: idToken,
        };

        const newUser = await this.userRepository.createOAuthUser(oauthPayload);
        return { user: newUser, isNewUser: true };
    }

    private async createSessionAndTokens(
        userId: string,
        clientIp: string,
        userAgent: UserAgentInfo
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = JwtManager.generateAccessToken(userId);
        const { token: refreshToken, jti, expIn } = JwtManager.generateRefreshToken(userId);
        const expiresAt = new Date(Date.now() + expIn * 1000);

        const sessionPayload: CreateSessionPayload = {
            userId,
            sessionToken: jti,
            ip: clientIp,
            userAgent,
            expiresAt,
        };

        await this.authRepository.createSession(sessionPayload);
        await this.tokenService.setRefreshToken(jti);
        await this.userRepository.setLastLogin(userId);

        return { accessToken, refreshToken };
    }
}