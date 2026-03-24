import { z } from "zod";

export const ValidatePromoSchema = z.object({
    code: z.string().min(1, "Promo code is required"),
    packageId: z.string().optional(),
    courseId: z.string().optional(),
});