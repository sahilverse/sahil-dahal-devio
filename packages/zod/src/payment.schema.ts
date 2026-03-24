import { z } from "zod";

export const InitiatePaymentSchema = z.object({
    packageId: z.string().min(1, "Package ID is required"),
    promoCode: z.string().optional(),
});