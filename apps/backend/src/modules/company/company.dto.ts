import { CreateCompanyInput, UpdateCompanyInput } from "@devio/zod-utils";
import { CompanyRole, CompanyVerificationTier } from "../../generated/prisma/client";

export interface CompanyResponseDto {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    location: string | null;
    size: string | null;
    isVerified: boolean;
    verificationTier: CompanyVerificationTier;
    verifiedDomain: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    owner?: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
    members?: {
        userId: string;
        role: CompanyRole;
        user: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
        };
    }[];
}

export type CreateCompanyDto = CreateCompanyInput;
export type UpdateCompanyDto = UpdateCompanyInput;

export interface ManageMemberDto {
    userId: string;
    action: "ADD" | "REMOVE" | "UPDATE_ROLE";
    role?: CompanyRole;
}
