import { AccountStatus, ProviderType } from "../../generated/prisma/client";
import { Prisma } from "../../generated/prisma/client";

export interface CreateUserPayload {
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string;
    password: string | null;
}

export interface CreateAccountPayload {
    userId: string;
    provider: ProviderType;
    providerAccountId: string;
    id_token: string | null;
}

export interface CreateOAuthUserPayload
    extends Omit<CreateUserPayload, 'username'>,
    CreateAccountPayload {
    avatarUrl: string | null;
}

export interface AccountStatusPayload {
    userId: string;
    status: AccountStatus;
    reason?: string;
    performedBy?: string;
}

export interface OnboardingPayload {
    username: string;
    firstName: string;
    lastName: string;
}

export interface UpdateNamesPayload {
    firstName: string;
    lastName: string;
}

export interface UpdateProfilePayload {
    title?: string | null;
    city?: string | null;
    country?: string | null;
    socials?: {
        github?: string | null;
        linkedin?: string | null;
        twitter?: string | null;
        facebook?: string | null;
        instagram?: string | null;
        youtube?: string | null;
        website?: string | null;
    } | null;
}

export type UserProfile = Prisma.UserGetPayload<{
    include: {
        profile: true;
        role: true;
        userStreak: true;
        experiences: { include: { company: true } };
        educations: true;
        certifications: true;
        projects: true;
        skills: { include: { skill: true } };
        userAchievements: { include: { achievement: true } };
        activityLogs: true;
        _count: {
            select: {
                followers: true;
                following: true;
                userAchievements: true;
            };
        };
        submissions: {
            where: { status: "ACCEPTED" };
            select: {
                createdAt: true;
                problem: {
                    select: { id: true; title: true; slug: true; difficulty: true };
                };
            };
        };
        cyberRoomEnrollments: {
            where: { completedAt: { not: null } };
            select: {
                completedAt: true;
                room: {
                    select: { id: true; title: true; slug: true; difficulty: true };
                };
            };
        };
    };
}>;

export interface CreateExperiencePayload {
    title: string;
    companyName: string;
    companyId?: string | null;
    location?: string | null;
    type?: string | null;
    startDate: Date;
    endDate?: Date | null;
    isCurrent: boolean;
    description?: string | null;
}

export interface UpdateExperiencePayload extends Partial<CreateExperiencePayload> { }

export interface CreateEducationPayload {
    school: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startDate: Date;
    endDate?: Date | null;
    grade?: string | null;
    activities?: string | null;
    description?: string | null;
}

export interface UpdateEducationPayload extends Partial<CreateEducationPayload> { }

export interface CreateCertificationPayload {
    name: string;
    issuingOrg: string;
    issueDate: Date;
    expirationDate?: Date | null;
    credentialId?: string | null;
    credentialUrl?: string | null;
}

export interface UpdateCertificationPayload extends Partial<CreateCertificationPayload> { }
