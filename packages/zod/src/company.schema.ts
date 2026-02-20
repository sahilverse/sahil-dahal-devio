import { z } from "zod";

// Shared Enums
export enum CompanyRole {
    OWNER = "OWNER",
    RECRUITER = "RECRUITER",
    MEMBER = "MEMBER",
}

export enum CompanyVerificationTier {
    UNVERIFIED = "UNVERIFIED",
    DOMAIN_VERIFIED = "DOMAIN_VERIFIED",
    OFFICIAL = "OFFICIAL",
}

export enum JobType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    CONTRACT = "CONTRACT",
    FREELANCE = "FREELANCE",
    INTERNSHIP = "INTERNSHIP",
    REMOTE = "REMOTE",
}

export enum JobWorkplace {
    ON_SITE = "ON_SITE",
    HYBRID = "HYBRID",
    REMOTE = "REMOTE",
}

// Company Schemas
export const createCompanySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters").max(50, "Company name must be less than 50 characters").trim(),
    description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
    websiteUrl: z.url("Invalid website URL").optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    size: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).optional().or(z.literal("")),
    logoUrl: z.url("Invalid logo URL").optional().or(z.literal("")),
});

export const updateCompanySchema = createCompanySchema.partial();

export const domainVerificationSchema = z.object({
    email: z.string().email("Enter a valid company email"),
});

export const memberManagementSchema = z.object({
    userId: z.string().cuid(),
    action: z.enum(["ADD", "REMOVE", "UPDATE_ROLE"]),
    role: z.nativeEnum(CompanyRole).optional(),
});

// Job Schemas
export const createJobSchema = z.object({
    companyId: z.string().cuid("Invalid company ID"),
    title: z.string().min(5, "Job title must be at least 5 characters").max(100, "Job title must be less than 100 characters").trim(),
    description: z.string().min(20, "Job description must be at least 20 characters").trim(),
    type: z.enum(JobType),
    workplace: z.enum(JobWorkplace),
    location: z.string().optional().or(z.literal("")),
    salaryMin: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().int().min(0).nullable().optional()),
    salaryMax: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().int().min(0).nullable().optional()),
    currency: z.string().default("NPR"),
    applyLink: z.url("Invalid application link").optional().or(z.literal("")),
    topics: z.array(z.string()).optional().default([]),
}).refine((data) => {
    if (data.salaryMin !== null && data.salaryMax !== null && data.salaryMin !== undefined && data.salaryMax !== undefined) {
        return data.salaryMin <= data.salaryMax;
    }
    return true;
}, {
    message: "Minimum salary cannot be greater than maximum salary",
    path: ["salaryMax"],
});

export const updateJobSchema = createJobSchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
