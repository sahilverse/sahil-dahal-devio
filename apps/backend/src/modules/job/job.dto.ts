import { CreateJobInput, UpdateJobInput } from "@devio/zod-utils";
import { JobType, JobWorkplace, CompanyVerificationTier } from "../../generated/prisma/client";

export interface JobResponseDto {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: JobType;
    workplace: JobWorkplace;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    applyLink: string | null;
    isActive: boolean;
    isFeatured: boolean;
    companyId: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    company?: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        isVerified: boolean;
        verificationTier: CompanyVerificationTier;
    } | null;
    topics?: {
        topic: {
            id: string;
            name: string;
            slug: string;
        };
    }[];
}

export type CreateJobDto = CreateJobInput;
export type UpdateJobDto = UpdateJobInput;

export interface GetJobsParamsDto {
    companyId?: string;
    isActive?: boolean | string;
    query?: string;
    type?: JobType;
    workplace?: JobWorkplace;
    skip?: number | string;
    take?: number | string;
}

export interface PaginatedJobsResponseDto {
    jobs: JobResponseDto[];
    total: number;
}
