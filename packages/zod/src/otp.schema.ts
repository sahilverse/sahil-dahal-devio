import { z } from "zod";


// verify OTP schema
export const verifyOTPSchema = z.union([
    // OTP
    z.object({
        email: z
            .email()
            .min(1, "Email is required")
            .transform((val) => val.trim().toLowerCase()),
        token: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),

    // JWT 
    z.object({
        token: z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, "Invalid token"),
    }),
]);



