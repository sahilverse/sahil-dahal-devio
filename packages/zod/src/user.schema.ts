import * as z from "zod";

export const updateProfileSchema = z.object({
    title: z
        .string()
        .max(100, "Title is too long")
        .refine(
            (val) => !val || val.trim().split(/\s+/).filter(Boolean).length <= 30,
            "Title must be at most 30 words"
        )
        .trim()
        .optional()
        .nullable(),
    city: z
        .string()
        .max(50, "City name is too long")
        .trim()
        .optional()
        .nullable(),
    country: z
        .string()
        .max(50, "Country name is too long")
        .trim()
        .optional()
        .nullable(),
    socials: z
        .object({
            github: z.string().url().optional().nullable(),
            linkedin: z.string().url().optional().nullable(),
            twitter: z.string().url().optional().nullable(),
            facebook: z.string().url().optional().nullable(),
            instagram: z.string().url().optional().nullable(),
            youtube: z.string().url().optional().nullable(),
            website: z.string().url().optional().nullable(),
        })
        .optional()
        .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateNamesSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name is too long")
        .trim(),
    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name is too long")
        .trim(),
});

export type UpdateNamesInput = z.infer<typeof updateNamesSchema>;
