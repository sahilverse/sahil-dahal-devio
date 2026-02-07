import * as z from "zod";
import { passwordRules, confirmPasswordRule } from "./utils";


export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, "Email or username is required")
        .trim()
        .toLowerCase(),
    password: z.string().min(1, "Password is required"),
});


export const registerSchema = z.object({
    firstName: z
        .string()
        .min(3, "First name is too short")
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
        .toLowerCase(),

    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username is too long")
        .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain alphanumeric characters and underscores")
        .trim()
        .toLowerCase(),

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
        .regex(/^[a-zA-Z0-9_]+$/, "Name can only contain alphanumeric characters and underscores")
        .trim()
        .toLowerCase(),

    firstName: z
        .string()
        .min(3, "First name is too short")
        .max(20, "First name is too long")
        .trim(),

    lastName: z
        .string()
        .min(3, "Last name is too short")
        .max(20, "Last name is too long")
        .trim(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

