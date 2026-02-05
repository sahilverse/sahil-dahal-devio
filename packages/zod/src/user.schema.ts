import * as z from "zod";

export const updateProfileSchema = z.object({
    title: z
        .string()
        .refine(
            (val) => !val || val.trim().split(/\s+/).filter(Boolean).length >= 3,
            "Title must be at least 3 words"
        )
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
            github: z.url().optional().nullable(),
            linkedin: z.url().optional().nullable(),
            twitter: z.url().optional().nullable(),
            facebook: z.url().optional().nullable(),
            instagram: z.url().optional().nullable(),
            youtube: z.url().optional().nullable(),
            website: z.url().optional().nullable(),
        })
        .optional()
        .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateProfileTitleSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 words")
        .refine(
            (val) => val.trim().split(/\s+/).filter(Boolean).length >= 3,
            "Title must be at least 3 words"
        )
        .refine(
            (val) => val.trim().split(/\s+/).filter(Boolean).length <= 30,
            "Title must be at most 30 words"
        )
        .trim(),
});

export const updateProfileLocationSchema = z
    .object({
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
    })
    .refine(
        (data) => {
            const hasCity = data.city && data.city.trim().length >= 3;
            const hasCountry = data.country && data.country.trim().length >= 3;
            return hasCity || hasCountry;
        },
        {
            message: "At least one location field must be filled (min 3 characters)",
            path: ["city"],
        }
    );

export const updateNamesSchema = z.object({
    firstName: z
        .string()
        .min(3, "First name must be at least 3 characters")
        .max(50, "First name is too long")
        .trim(),
    lastName: z
        .string()
        .min(3, "Last name must be at least 3 characters")
        .max(50, "Last name is too long")
        .trim(),
});

export type UpdateNamesInput = z.infer<typeof updateNamesSchema>;
