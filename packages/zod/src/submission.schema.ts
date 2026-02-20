import { z } from "zod";

export const RunSubmissionSchema = z.object({
    slug: z.string().min(1, "Problem slug is required"),
    language: z.string().min(1, "Language is required"),
    code: z.string().min(1, "Code content is required"),
});

export const SubmitSubmissionSchema = z.object({
    slug: z.string().min(1, "Problem slug is required"),
    language: z.string().min(1, "Language is required"),
    code: z.string().min(1, "Code content is required"),
    eventId: z.uuid().optional().nullable(),
});

export const EventSubmitSubmissionSchema = z.object({
    language: z.string().min(1, "Language is required"),
    code: z.string().min(1, "Code content is required"),
});

export const GetSubmissionsSchema = z.object({
    cursor: z.string().optional(),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : 10), z.number().min(1).max(100)).optional(),
});

export type RunSubmissionRequest = z.infer<typeof RunSubmissionSchema>;
export type SubmitSubmissionRequest = z.infer<typeof SubmitSubmissionSchema>;
export type GetSubmissionsQuery = z.infer<typeof GetSubmissionsSchema>;
