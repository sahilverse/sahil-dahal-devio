export interface SubmissionResult {
    status: string;
    isPublic: boolean;
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    time: string | null;
    memory: number | null;
}

export interface Submission {
    id: string;
    language: string;
    status: string;
    runtime: number | null;
    memory: number | null;
    score: number;
    error: string | null;
    eventId: string | null;
    createdAt: string;
    results: SubmissionResult[];
}
