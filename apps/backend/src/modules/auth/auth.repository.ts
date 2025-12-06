import { injectable, inject } from "inversify";
import type { PrismaClient, Session, VerificationToken, CodeType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CreateSessionInput, CreateVerificationTokenInput } from "./auth.types";

@injectable()
export class AuthRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createSession(input: CreateSessionInput): Promise<Session> {
        return this.prisma.session.create({
            data: input,
        });
    }

    async getSessionByToken(token: string): Promise<Session | null> {
        return this.prisma.session.findUnique({
            where: { sessionToken: token },
        });
    }

    async deleteSession(token: string): Promise<void> {
        await this.prisma.session.delete({
            where: { sessionToken: token },
        });
    }

    async deleteUserSessions(userId: string): Promise<void> {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
    }

    /** VERIFICATION TOKENS */
    async createVerificationToken(input: CreateVerificationTokenInput): Promise<VerificationToken> {
        return this.prisma.verificationToken.create({
            data: input,
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

    async deleteExpiredVerificationTokens(): Promise<void> {
        await this.prisma.verificationToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
    }


}
