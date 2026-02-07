import { z } from "zod";

export const createTopicSchema = z.object({
    name: z
        .string()
        .min(1, "Topic name must be at least 1 character")
        .max(50, "Topic name must be at most 50 characters")
        .trim(),
});

export const searchTopicSchema = z.object({
    q: z.string().min(1).trim(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type SearchTopicInput = z.infer<typeof searchTopicSchema>;
