import { injectable, inject } from "inversify";
import type { User, Role, PrismaClient } from "../../generated/prisma/client";
import type { CreateUserPayload } from "./user.types";
import { TYPES } from "../../types";

@injectable()
export class UserRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createUser(payload: CreateUserPayload): Promise<User> {
        return await this.prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                username: payload.username,
                email: payload.email,
                password: payload.password,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updatePassword(userId: string, password: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password },
        });
    }

    async deactivateUser(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false
            }
        });
    }

    async activateUser(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: true
            }
        });
    }

    async updateEmailVerified(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: new Date()
            }
        });
    }

    async updateProfilePicture(userId: string, imageUrl: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                image: imageUrl
            }
        });
    }

    async deleteProfilePicture(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                image: null
            }
        });
    }

    async setLastLogin(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastLogin: new Date()
            }
        });
    }

    async updateUserRole(userId: string, role: Role): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                role
            }
        });
    }

}