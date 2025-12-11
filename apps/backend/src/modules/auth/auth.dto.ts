import { User, Role } from "../../generated/prisma/client";

export interface AuthUserDTO {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string;
    avatarUrl: string | null;
    role: Role;
    createdAt: Date;
}

export function toAuthUserDTO(user: User): AuthUserDTO {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        role: user.role,
        createdAt: user.createdAt,
    };
}