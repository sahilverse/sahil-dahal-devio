import { z } from "zod";

export const InitiatePaymentSchema = z.object({
    packageId: z.string().min(1, "Package ID is required"),
    provider: z.enum(["ESEWA", "KHALTI"], { message: "Invalid payment provider" }),
    promoCode: z.string().optional(),
});