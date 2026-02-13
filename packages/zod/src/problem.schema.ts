import { z } from "zod";

export const GetProblemsSchema = z.object({
    cursor: z.string().optional(),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 10), z.number().min(1).max(100)).optional(),
    search: z.string().optional(),
    difficulty: z.preprocess(
        (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
        z.array(z.enum(["EASY", "MEDIUM", "HARD"]))
    ).optional(),
    topics: z.preprocess(
        (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
        z.array(z.string())
    ).optional(),
    status: z.preprocess(
        (val) => (typeof val === "string" ? [val] : Array.isArray(val) ? val : []),
        z.array(z.enum(["UNSOLVED", "ATTEMPTED", "SOLVED"]))
    ).optional(),
    hasBounty: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

export const GetBoilerplateSchema = z.object({
    language: z.string().min(1)
});

export const SaveDraftSchema = z.object({
    language: z.string().min(1),
    code: z.string().min(1)
});

export type GetProblemsQuery = z.infer<typeof GetProblemsSchema>;
export type GetBoilerplateQuery = z.infer<typeof GetBoilerplateSchema>;
export type SaveDraftRequest = z.infer<typeof SaveDraftSchema>;
