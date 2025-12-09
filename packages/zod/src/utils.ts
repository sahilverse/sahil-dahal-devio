import { z } from "zod";

export const passwordRules = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/\d/, "Password must contain at least 1 digit")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character")
    .trim();



export const confirmPasswordRule = z.string().min(1, "Confirm password is required").trim();