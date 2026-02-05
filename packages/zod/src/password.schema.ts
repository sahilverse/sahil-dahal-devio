import { z } from "zod";
import { passwordRules, confirmPasswordRule } from "./utils";


// resetPasswordSchema
export const resetPasswordSchema = z.object({
    newPassword: passwordRules,
    confirmNewPassword: confirmPasswordRule,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: passwordRules,
    confirmPassword: confirmPasswordRule,
}).refine(
    (values) => values.newPassword === values.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

