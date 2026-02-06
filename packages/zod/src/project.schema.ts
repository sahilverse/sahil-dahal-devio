import { z } from "zod";

export const projectSchema = z.object({
    title: z
        .string()
        .min(2, "Project title must be at least 2 characters")
        .max(100, "Project title is too long")
        .trim(),
    description: z
        .string()
        .max(1000, "Description is too long")
        .nullable()
        .optional(),
    url: z
        .url("Invalid URL format")
        .nullable()
        .optional()
        .or(z.literal("")),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z
        .string()
        .nullable()
        .optional()
        .transform((val) => (val ? new Date(val) : null)),
    skills: z.array(z.string()).default([]),
}).refine(
    (data) => {
        if (!data.endDate) return true;
        return data.startDate <= data.endDate;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

export const createProjectSchema = projectSchema;
export const updateProjectSchema = projectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
