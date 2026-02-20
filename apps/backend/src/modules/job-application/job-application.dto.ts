import { ApplicationStatus } from "../../generated/prisma/client";

export interface CreateJobApplicationDto {
    jobId: string;
    coverLetter?: string;
    resumeUrl?: string;
}

export interface JobApplicationResponseDto {
    id: string;
    jobId: string;
    userId: string;
    status: ApplicationStatus;
    coverLetter: string | null;
    resumeUrl: string | null;
    appliedAt: Date;
    updatedAt: Date;
    job?: {
        id: string;
        title: string;
        slug: string;
        company: {
            name: string;
            logoUrl: string | null;
        } | null;
    };
    user?: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
}
