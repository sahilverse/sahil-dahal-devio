export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
    "cpp": 54,
    "java": 62,
    "python": 71,
    "javascript": 63,
    "rust": 73,
    "csharp": 51,
    "go": 60,
    "php": 68
};

export const JUDGE0_STATUS = {
    IN_QUEUE: 1,
    PROCESSING: 2,
    ACCEPTED: 3,
    WRONG_ANSWER: 4,
    TIME_LIMIT_EXCEEDED: 5,
    COMPILE_ERROR: 6,
    MEMORY_LIMIT_EXCEEDED: 6,
    RUNTIME_ERROR_SIGSEGV: 7,
    RUNTIME_ERROR_SIGXFSZ: 8,
    RUNTIME_ERROR_SIGFPE: 9,
    RUNTIME_ERROR_SIGABRT: 10,
    RUNTIME_ERROR_NZEC: 11,
    RUNTIME_ERROR_OTHER: 12,
    INTERNAL_ERROR: 13,
    EXEC_FORMAT_ERROR: 14,
} as const;

export const SUBMISSION_POLL_INTERVAL = 1000;
export const SUBMISSION_MAX_POLLS = 10;
