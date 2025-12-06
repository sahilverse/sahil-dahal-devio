import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { RedisManager } from "../../config";
import type { CreateUserPayload, UserRepository } from "../user";
import { REFRESH_TOKEN_PREFIX, JWT_REFRESH_EXPIRATION_DAYS } from "../../config/constants";
import { AuthRepository } from "./auth.repository";
import { BcryptUtils, ApiError, removePasswordFromUser, JwtManager } from "../../utils";
import type { User } from "../../generated/prisma/client";
import type { LoginInput as LoginPayload } from '@devio/zod-utils';
import { StatusCodes } from "http-status-codes";
import { LoginServiceResponse } from "./auth.types";

@injectable()
export class AuthService {

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
    ) { }


    async registerUser(payload: CreateUserPayload): Promise<Omit<User, "password">> {
        const { firstName, lastName, username, email, password } = payload;

        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new ApiError("Email already in use", StatusCodes.BAD_REQUEST);
        }

        const existingUserByUsername = await this.userRepository.findByUsername(username);
        if (existingUserByUsername) {
            throw new ApiError("Username already in use", StatusCodes.BAD_REQUEST);
        }

        const hashedPassword = await BcryptUtils.hashPassword(password);

        const user = await this.userRepository.createUser({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
        });

        return removePasswordFromUser(user);

    }

    async loginUser(payload: LoginPayload): Promise<LoginServiceResponse> {
        const { identifier, password } = payload;

        const user = await this.userRepository.findByEmail(identifier) || await this.userRepository.findByUsername(identifier);

        if (!user) {
            throw new ApiError({ "identifier": "User not found" }, StatusCodes.UNAUTHORIZED);
        }

        const isPasswordValid = await BcryptUtils.comparePassword(password, user.password!);

        if (!isPasswordValid) {
            throw new ApiError({ "password": "Incorrect Password" }, StatusCodes.UNAUTHORIZED);
        }

        if (!user.isActive) {
            await this.userRepository.activateUser(user.id);
        }

        const accessToken = JwtManager.generateAccessToken(user.id);
        const { token: refreshToken, jti } = JwtManager.generateRefreshToken(user.id);

        await this.setRefreshToken(jti);
        await this.userRepository.setLastLogin(user.id);
        await this.authRepository.createSession({
            userId: user.id,
            sessionToken: jti,
            expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
        });

        return {
            user: removePasswordFromUser(user),
            accessToken,
            refreshToken
        };
    }

    async logoutUser(refreshToken: string): Promise<void> {
        const { jti } = JwtManager.verifyRefreshToken(refreshToken);
        await this.revokeRefreshToken(jti!);
        await this.authRepository.deleteSession(jti!);
    }

    private async setRefreshToken(jti: string): Promise<void> {
        try {
            await this.redisClient.set(
                `${REFRESH_TOKEN_PREFIX}${jti}`,
                "valid",
                "EX",
                JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60
            );
        } catch (err: any) {
            throw new Error(`Failed to set refresh token in Redis: ${err.message}`);
        }
    }

    private async revokeRefreshToken(jti: string): Promise<void> {
        try {
            await this.redisClient.del(`${REFRESH_TOKEN_PREFIX}${jti}`);
        } catch (err: any) {
            throw new Error(`Failed to revoke refresh token in Redis: ${err.message}`);
        }
    }

    private get redisClient() {
        return this.redisManager.getPub();
    }

}