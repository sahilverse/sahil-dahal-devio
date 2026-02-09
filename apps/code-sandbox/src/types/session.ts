export interface ExecutionSession {
    id: string;
    language: string;
    code: string;
    containerId: string;
    processId?: string;
    startTime: number;
    lastActivityTime: number;
    isActive: boolean;
}

export interface SessionRequest {
    sessionId: string;
    input?: string;
}

export interface SessionResponse {
    sessionId: string;
    stdout: string;
    stderr: string;
    exitCode?: number;
    executionTime?: number;
    error?: string;
}

export interface LanguageConfig {
    image: string;
    compileCommand: string[] | null;
    runCommand: string[];
    extension: string;
    timeout: number;
}
