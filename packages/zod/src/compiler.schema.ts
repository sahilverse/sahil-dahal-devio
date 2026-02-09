import { z } from "zod";

export const ExecutionRequestSchema = z.object({
    language: z.string(),
    code: z.string(),
    sessionId: z.string()
});


