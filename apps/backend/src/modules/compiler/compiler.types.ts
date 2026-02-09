export interface ExecutionRequest {
    language?: string;
    code?: string;
    input?: string;
    sessionId?: string;
}

export interface ExecutionResult {
    sessionId: string;
    stdout: string;
    stderr: string;
    executionTime: number;
}
