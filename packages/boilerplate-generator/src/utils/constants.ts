import type { Language } from "../types";

export const LANGUAGE_EXTENSIONS: Record<Language, string> = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    rust: 'rs',
    go: 'go',
    php: 'php'
};

export const SUPPORTED_LANGUAGES: Language[] = [
    'python', 'javascript', 'java', 'cpp',
    'csharp', 'rust', 'go', 'php'
];
