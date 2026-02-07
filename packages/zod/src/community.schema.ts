
import { z } from "zod";

export const CommunityVisibility = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
    RESTRICTED: 'RESTRICTED'
} as const;

export const createCommunitySchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(20, "Name must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain alphanumeric characters and underscores")
        .trim()
        .toLowerCase(),

    description: z.string()
        .max(500, "Description must be at most 500 characters")
        .optional(),

    visibility: z.enum(CommunityVisibility),

    tags: z.array(z.string().min(1, "Tag cannot be empty"))
        .min(1, "At least 1 tag is required")
        .max(5, "Maximum 5 tags are allowed"),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
