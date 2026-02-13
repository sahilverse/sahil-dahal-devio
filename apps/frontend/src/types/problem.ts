export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}

export interface Topic {
    id: string;
    name: string;
    slug: string;
}

export interface TestCase {
    id: string;
    input: string;
    output: string;
}

export interface Problem {
    id: string;
    title: string;
    slug: string;
    difficulty: Difficulty;
    description: string;
    topics: Topic[];
    testCases: TestCase[];
    inputStructure?: { name: string; type: string }[];
    cipherReward: number;
    createdAt: string;
    updatedAt: string;
}

export type ProblemSolutionStatus = "UNSOLVED" | "ATTEMPTED" | "SOLVED";

export interface ProblemListItem {
    id: string;
    title: string;
    slug: string;
    difficulty: Difficulty;
    topics: { name: string; slug: string }[];
    status: ProblemSolutionStatus;
    cipherReward: number;
    createdAt: string;
}

export interface PaginatedProblems {
    items: ProblemListItem[];
    nextCursor: string | null;
}
