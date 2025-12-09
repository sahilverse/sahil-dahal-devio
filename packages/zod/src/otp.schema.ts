import { z } from "zod";


// verify OTP schema
export const verifyPasswordResetTokenSchema = z.union([
    // OTP
    z.object({
        identifier: z
            .string()
            .min(1, "Email or username is required")
            .transform(val => val.trim().toLowerCase()),
        token: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),

    // JWT 
    z.object({
        token: z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, "Invalid token"),
    }),
]);

export const verifyEmailVerificationTokenSchema = z.union([
    // OTP
    z.object({
        email: z
            .email("Invalid email address")
            .min(1, "Email is required")
            .transform(val => val.trim().toLowerCase()),
        token: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),

    // JWT 
    z.object({
        token: z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, "Invalid token"),
    }),
]);

