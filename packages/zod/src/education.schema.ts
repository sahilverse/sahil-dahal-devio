import * as z from "zod";

export const educationSchema = z.object({
    school: z
        .string()
        .min(2, "School name must be at least 2 characters")
        .max(100, "School name is too long")
        .trim(),
    degree: z
        .string()
        .max(100, "Degree name is too long")
        .trim()
        .optional()
        .nullable(),
    fieldOfStudy: z
        .string()
        .max(100, "Field of study is too long")
        .trim()
        .optional()
        .nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    grade: z
        .string()
        .max(50, "Grade is too long")
        .trim()
        .optional()
        .nullable(),
    activities: z
        .string()
        .max(500, "Activities description is too long")
        .trim()
        .optional()
        .nullable(),
    description: z
        .string()
        .max(2000, "Description is too long")
        .trim()
        .optional()
        .nullable(),
}).refine((data) => {
    if (data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export const createEducationSchema = educationSchema;
export const updateEducationSchema = educationSchema.partial();

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
