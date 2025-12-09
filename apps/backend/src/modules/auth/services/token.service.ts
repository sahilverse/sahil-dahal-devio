import { injectable, inject } from "inversify";
import { TYPES } from "../../../types";
import { RedisManager } from "../../../config";
import {
    JWT_REFRESH_EXPIRATION_DAYS,
    RESET_PASSWORD_SESSION_TOKEN_PREFIX,
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    REFRESH_TOKEN_PREFIX
} from "../../../config/constants";

@injectable()
export class TokenService {

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager
    ) { }


    async setResetPasswordSessionToken(jti: string): Promise<void> {
        try {
            await this.redisClient.set(
                `${RESET_PASSWORD_SESSION_TOKEN_PREFIX}${jti}`,
                "valid",
                "EX",
                JWT_RESET_PASSWORD_EXPIRATION_MINUTES * 60
            );
        } catch (err: any) {
            throw new Error(`Failed to set reset password session token in Redis: ${err.message}`);
        }
    }

    async revokeResetPasswordSessionToken(jti: string): Promise<void> {
        try {
            await this.redisClient.del(`${RESET_PASSWORD_SESSION_TOKEN_PREFIX}${jti}`);
        } catch (err: any) {
            throw new Error(`Failed to revoke reset password session token in Redis: ${err.message}`);
        }
    }


    async setRefreshToken(jti: string): Promise<void> {
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

    async revokeRefreshToken(jti: string): Promise<void> {
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