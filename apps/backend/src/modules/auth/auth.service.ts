import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { RedisManager } from "../../config";
import type { CreateUserPayload } from "../user";
import { REFRESH_TOKEN_PREFIX, JWT_REFRESH_EXPIRATION_DAYS } from "../../config/constants";
import { UserRepository } from "../user";


@injectable()
export class AuthService {
    private redisClient;

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.UserRepository) private userRepository: UserRepository
    ) {
        this.redisClient = this.redisManager.getPub();
    }


    async registerUser(payload: CreateUserPayload): Promise<void> {
        const { firstName, lastName, username, email, password } = payload;

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


}