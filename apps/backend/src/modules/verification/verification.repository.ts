import { injectable, inject } from "inversify";
import type { PrismaClient, VerificationToken, CodeType, } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CreateVerificationTokenPayload } from "./verification.types";


@injectable()
export class VerificationRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createVerificationToken(payload: CreateVerificationTokenPayload): Promise<VerificationToken> {
        return this.prisma.verificationToken.create({
            data: payload,
        });
    }

    async getVerificationToken(code: string, type: CodeType): Promise<VerificationToken | null> {
        return this.prisma.verificationToken.findFirst({
            where: { code, type },
        });
    }

    async deleteVerificationToken(id: string): Promise<void> {
        await this.prisma.verificationToken.delete({
            where: { id },
        });
    }

    async deleteUserVerificationTokens(userId: string): Promise<void> {
        await this.prisma.verificationToken.deleteMany({
            where: { userId },
        });
    }

    async deleteExpiredVerificationTokens(): Promise<void> {
        await this.prisma.verificationToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
    }
}