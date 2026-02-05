import * as z from "zod";

export const EmploymentType = [
    "FULL_TIME",
    "PART_TIME",
    "SELF_EMPLOYED",
    "FREELANCE",
    "CONTRACT",
    "INTERNSHIP",
    "APPRENTICESHIP",
    "SEASONAL",
] as const;

export const experienceSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title is too long")
        .trim(),
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name is too long")
        .trim(),
    companyId: z.string().cuid().optional().nullable(),
    location: z.string().max(100, "Location is too long").trim().optional().nullable(),
    type: z.enum(EmploymentType).optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    isCurrent: z.boolean().default(false),
    description: z.string().max(2000, "Description is too long").trim().optional().nullable(),
}).refine((data) => {
    if (!data.isCurrent && !data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date is required if not currently working here",
    path: ["endDate"],
}).refine((data) => {
    if (data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export const createExperienceSchema = experienceSchema;
export const updateExperienceSchema = experienceSchema.partial();

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
