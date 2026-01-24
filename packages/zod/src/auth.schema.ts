import * as z from "zod";
import { passwordRules, confirmPasswordRule } from "./utils";


export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, "Email or username is required")
        .transform(val => val.trim().toLowerCase()),
    password: z.string().min(1, "Password is required"),
});


export const registerSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .max(20, "First name is too long")
        .trim(),

    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(20, "Last name is too long")
        .trim(),

    email: z
        .email("Invalid email format")
        .min(1, "Email is required")
        .transform(val => val.trim().toLowerCase()),

    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username is too long")
        .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, and hyphen allowed")
        .trim(),

    password: passwordRules,
    confirmPassword: confirmPasswordRule,
})
    .refine(
        (values) => values.password === values.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );




export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;


export const onboardingSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username is too long")
        .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, and hyphen allowed")
        .trim(),

    firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name is too long")
        .trim(),

    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name is too long")
        .trim(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

