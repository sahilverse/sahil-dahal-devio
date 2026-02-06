import * as z from "zod";

export const certificationSchema = z.object({
    name: z
        .string()
        .min(3, "Certification name must be at least 3 characters")
        .max(100, "Certification name is too long")
        .trim(),
    issuingOrg: z
        .string()
        .min(2, "Issuing organization must be at least 2 characters")
        .max(100, "Issuing organization name is too long")
        .trim(),
    issueDate: z.preprocess((arg) => (arg === "" || arg === null ? undefined : arg), z.coerce.date()),
    expirationDate: z.preprocess((arg) => (arg === "" ? null : arg), z.coerce.date().optional().nullable()),
    credentialId: z.string().max(100, "Credential ID is too long").trim().optional().nullable(),
    credentialUrl: z.url("Invalid credential URL").trim().optional().nullable().or(z.literal("")),
}).refine((data) => {
    if (data.expirationDate && data.issueDate > data.expirationDate) {
        return false;
    }
    return true;
}, {
    message: "Expiration date must be after issue date",
    path: ["expirationDate"],
});

export const createCertificationSchema = certificationSchema;
export const updateCertificationSchema = certificationSchema.partial();

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
