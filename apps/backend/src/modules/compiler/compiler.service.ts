import { injectable } from "inversify";
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { plainToInstance } from "class-transformer";
import { CODE_SANDBOX_URL } from '../../config/constants';
import { ApiError } from '../../utils';
import { ExecutionRequest } from './compiler.types';
import { ExecutionResultDto, LanguageListDto } from './compiler.dto';

@injectable()
export class CompilerService {
    private sandboxClient;

    constructor() {
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

    async executeCode(data: ExecutionRequest): Promise<ExecutionResultDto> {
        let sessionId = data.sessionId as string | undefined;
        try {
            if (!sessionId) {
                const startRes = await this.sandboxClient.post("/session/start", { language: data.language });
                const startResult = startRes.data?.result ?? startRes.data;
                sessionId = startResult?.sessionId;

                if (!sessionId) {
                    throw new ApiError("Sandbox did not return sessionId", StatusCodes.BAD_GATEWAY);
                }
            }

            let execResult;
            if (data.input) {
                execResult = await this.sendInput(sessionId, data.input);
            }

            execResult = (await this.sandboxClient.post(`/session/${sessionId}/execute`, { code: data.code })).data?.result

            return plainToInstance(
                ExecutionResultDto,
                execResult,
                { excludeExtraneousValues: true }
            );
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.errorMessage || "Failed to execute code in sandbox",
                error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async sendInput(sessionId: string, input: string): Promise<ExecutionResultDto> {
        try {
            const response = await this.sandboxClient.post(`/session/${sessionId}/input`, { input });
            return plainToInstance(ExecutionResultDto, response.data.result, { excludeExtraneousValues: true });
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.errorMessage || "Failed to send input to sandbox",
                error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async endSession(sessionId: string): Promise<void> {
        try {
            await this.sandboxClient.post(`/session/${sessionId}/end`);
        } catch (error: any) {
            if (error.response?.status === StatusCodes.NOT_FOUND) return;

            throw new ApiError(
                error.response?.data?.errorMessage || "Failed to end session",
                error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}
