import { z } from "zod";

export const providers = ["ESEWA", "KHALTI"] as const;

export const InitiatePaymentSchema = z.object({
    packageId: z.string().min(1, "Package ID is required"),
    provider: z.enum(providers, { message: "Invalid payment provider" }),
    promoCode: z.string().optional(),
});