import { z } from "zod";

export const createSkillSchema = z.object({
    name: z
        .string()
        .min(1, "Skill name must be at least 1 character")
        .max(50, "Skill name must be at most 50 characters")
        .trim(),
});

export const searchSkillSchema = z.object({
    q: z.string().min(1).trim(),
});


export const createUserSkillSchema = z.object({
    name: z.string().min(1).trim(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type SearchSkillInput = z.infer<typeof searchSkillSchema>;
export type CreateUserSkillInput = z.infer<typeof createUserSkillSchema>;
