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
