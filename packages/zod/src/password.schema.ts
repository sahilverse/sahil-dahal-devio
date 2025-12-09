import { z } from "zod";
import { passwordRules, confirmPasswordRule } from "./utils";

// changePasswordSchema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current Password is required").trim(),
    newPassword: passwordRules,
    confirmNewPassword: confirmPasswordRule,
}).refine((data) => data.newPassword !== data.currentPassword, {
    message: "New Password must be different from Current Password",
    path: ["newPassword"],
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New Passwords do not match",
    path: ["confirmNewPassword"],
});


// resetPasswordSchema
export const resetPasswordSchema = z.object({
    newPassword: passwordRules,
    confirmNewPassword: confirmPasswordRule,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
})