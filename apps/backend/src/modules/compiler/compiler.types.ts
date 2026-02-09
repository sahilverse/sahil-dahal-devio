export interface ExecutionRequest {
    language: string;
    code: string;
    sessionId: string;
}

export interface ExecutionResult {
    sessionId: string;
    stdout: string;
    stderr: string;
    executionTime: number;
}
