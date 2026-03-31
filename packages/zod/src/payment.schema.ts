import { z } from "zod";

export const providers = ["ESEWA", "KHALTI"] as const;

export const InitiateCipherPaymentSchema = z.object({
    packageId: z.string().min(1, "Package ID is required"),
    provider: z.enum(providers, { message: "Invalid payment provider" }),
    promoCode: z.string().optional(),
});

export type InitiateCipherPaymentInput = z.infer<typeof InitiateCipherPaymentSchema>;

export const InitiateCoursePaymentSchema = z.object({
    courseId: z.string().min(1, "Course ID is required"),
    provider: z.enum(providers, { message: "Invalid payment provider" }),
    promoCode: z.string().optional(),
    cipherAmount: z.number().int().min(0).optional(),
});

export type InitiateCoursePaymentInput = z.infer<typeof InitiateCoursePaymentSchema>;