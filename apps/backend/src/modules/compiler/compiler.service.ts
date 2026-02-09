import { TYPES } from "../../types";
import { RedisManager } from "../../config/redis";
import { inject, injectable } from "inversify";
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { plainToInstance } from "class-transformer";
import { CODE_SANDBOX_URL } from '../../config/constants';
import { ApiError, logger } from '../../utils';
import { ExecutionRequest } from './compiler.types';
import { LanguageListDto } from './compiler.dto';

@injectable()
export class CompilerService {
    private sandboxClient;

    constructor(
        @inject(TYPES.RedisManager) private redisManager: RedisManager
    ) {
        this.sandboxClient = axios.create({
            baseURL: CODE_SANDBOX_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async getLanguages(): Promise<LanguageListDto> {
        try {
            const response = await this.sandboxClient.get('/languages');
            const languages = response.data.result.languages;

            return plainToInstance(LanguageListDto, { languages }, { excludeExtraneousValues: true });
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || "Failed to fetch languages from sandbox",
                error.response?.status || StatusCodes.SERVICE_UNAVAILABLE
            );
        }
    }

    async executeCode(data: ExecutionRequest): Promise<{ message: string }> {
        let sessionId = data.sessionId;

        try {
            const redis = this.redisManager.getPub();
            const sessionKey = `sandbox:session:${sessionId}`;

            const isInitialized = await redis.exists(sessionKey);

            if (!isInitialized) {
                const startRes = await this.sandboxClient.post("/session/start", {
                    language: data.language,
                    sessionId: data.sessionId
                });
                const startResult = startRes.data?.result;
                sessionId = startResult?.sessionId;
            }

            const commandChannel = `sandbox:command:${sessionId}`;
            const pubClient = this.redisManager.getPub();

            await pubClient.publish(
                commandChannel,
                JSON.stringify({
                    type: 'execute',
                    data: { code: data.code }
                })
            );

            return { message: "success" };
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.errorMessage || "Failed to start compiler session",
                error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async endSession(sessionId: string): Promise<void> {
        try {
            await this.sandboxClient.post(`/session/${sessionId}/end`);
        } catch (error: any) {
            if (error.response?.status === StatusCodes.NOT_FOUND) return;
            logger.warn(`Failed to clean up sandbox session ${sessionId}: ${error.message}`);
        }
    }
}
