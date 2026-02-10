import { injectable } from "inversify";
import axios, { AxiosInstance } from "axios";
import { JUDGE0_URL } from "../../config/constants";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";

export interface Judge0Submission {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    cpu_time_limit?: number;
    memory_limit?: number;
}

export interface Judge0Response {
    token: string;
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    status?: {
        id: number;
        description: string;
    };
    time?: string;
    memory?: number;
}

@injectable()
export class Judge0Service {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: JUDGE0_URL,
            timeout: 10000,
        });
    }

    async createSubmission(submission: Judge0Submission): Promise<string> {
        try {
            const response = await this.client.post("/submissions", submission);
            return response.data.token;
        } catch (error: any) {
            logger.error(`Judge0 single submission failed: ${error.message}`);
            throw new ApiError(`Execution engine error: ${error.message}`, StatusCodes.SERVICE_UNAVAILABLE);
        }
    }

    async createBatchSubmissions(submissions: Judge0Submission[]): Promise<string[]> {
        try {
            const response = await this.client.post("/submissions/batch", { submissions });
            return response.data.map((s: any) => s.token);
        } catch (error: any) {
            logger.error(`Judge0 batch submission failed: ${error.message}`);
            throw new ApiError(`Execution engine error: ${error.message}`, StatusCodes.SERVICE_UNAVAILABLE);
        }
    }

    async getSubmission(token: string): Promise<Judge0Response> {
        try {
            const response = await this.client.get(`/submissions/${token}?base64_encoded=false`);
            return response.data;
        } catch (error: any) {
            logger.error(`Judge0 get submission failed (${token}): ${error.message}`);
            throw new ApiError(`Execution engine status retrieval error: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getBatchSubmissions(tokens: string[]): Promise<Judge0Response[]> {
        try {
            const tokenStr = tokens.join(",");
            const response = await this.client.get(`/submissions/batch?tokens=${tokenStr}&base64_encoded=false`);
            return response.data.submissions;
        } catch (error: any) {
            logger.error(`Judge0 get batch submissions failed: ${error.message}`);
            throw new ApiError(`Execution engine batch status retrieval error: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
