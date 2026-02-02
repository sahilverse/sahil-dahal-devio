import { User } from "../../generated/prisma/client";

export interface AuthUserDTO {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string;
    emailVerified: Date | null;
    avatarUrl: string | null;
    role: string;
    createdAt: Date;
}

export function toAuthUserDTO(user: User): AuthUserDTO {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl || null,
        role: (user as any).role?.name || "user",
        createdAt: user.createdAt,
    };
}
