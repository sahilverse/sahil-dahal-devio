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


export type UserProfile = Prisma.UserGetPayload<{
    include: {
        profile: true;
        role: true;
        userStreak: true;
        experiences: true;
        educations: true;
        certifications: true;
        projects: true;
        skills: true;
        userAchievements: { include: { achievement: true } };
        activityLogs: true;
        _count: {
            select: {
                followers: true;
                following: true;
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