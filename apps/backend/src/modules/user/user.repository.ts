import { injectable, inject } from "inversify";
import type { User, Role, PrismaClient, AccountStatusHistory } from "../../generated/prisma/client";
import type { CreateUserPayload, AccountStatusPayload } from "./user.types";
import { TYPES } from "../../types";

@injectable()
export class UserRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createUser(payload: CreateUserPayload, emailVerified: Date | null = null): Promise<User> {
        return await this.prisma.user.create({
            data: {
                ...payload,
                emailVerified
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            },
        });
    }

    async findByEmailOrUsername(identifier: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: identifier, mode: "insensitive" } },
                    { username: { equals: identifier, mode: "insensitive" } },
                ],
            },
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


    async markEmailAsVerified(userId: string): Promise<void> {
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
                avatarUrl: imageUrl
            }
        });
    }

    async deleteProfilePicture(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                avatarUrl: null
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

    async updateAccountStatus(payload: AccountStatusPayload): Promise<void> {
        const { userId, status, reason, performedBy } = payload;
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { accountStatus: status }
            }),
            this.prisma.accountStatusHistory.create({
                data: {
                    userId,
                    status,
                    reason,
                    performedBy,
                }
            })
        ]);
    }

    async getLastAccountStatusHistory(userId: string): Promise<AccountStatusHistory | null> {
        const history = await this.prisma.accountStatusHistory.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        return history;
    }


}