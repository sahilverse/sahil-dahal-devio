import { injectable } from "inversify";
import { prisma } from "../../config";
import type { User, Role } from "../../generated/prisma/client";
import type { CreateUserPayload } from "./user.types";

@injectable()
export class UserRepository {
    async createUser(payload: CreateUserPayload): Promise<Omit<User, "password">> {
        return await prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                username: payload.username,
                email: payload.email,
                password: payload.password,
            },
        }) as Omit<User, "password">;
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { username },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async updatePassword(userId: string, password: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { password },
        });
    }

    async deactivateUser(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false
            }
        });
    }

    async activateUser(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: true
            }
        });
    }

    async updateEmailVerified(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: new Date()
            }
        });
    }

    async updateProfilePicture(userId: string, imageUrl: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: imageUrl
            }
        });
    }

    async deleteProfilePicture(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: null
            }
        });
    }

    async setLastLogin(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                lastLogin: new Date()
            }
        });
    }

    async updateUserRole(userId: string, role: Role): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                role
            }
        });
    }

}