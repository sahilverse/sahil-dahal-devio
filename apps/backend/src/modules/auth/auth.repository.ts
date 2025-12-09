import { injectable, inject } from "inversify";
import type { PrismaClient, Session, SessionType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CreateSessionPayload, UploadSessionPayload } from "./auth.types";
import type { UserAgentInfo } from "./auth.types";
import { Prisma } from "../../generated/prisma/client";

@injectable()
export class AuthRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createSession(payload: CreateSessionPayload,): Promise<Session> {
        const userAgentJson = this.toUserAgentInfoJson(payload.userAgent);
        return this.prisma.session.create({
            data: {
                ...payload,
                userAgent: userAgentJson,
            }
        });
    }

    async updateSession(payload: UploadSessionPayload): Promise<void> {
        const userAgentJson = this.toUserAgentInfoJson(payload.userAgent);
        await this.prisma.session.updateMany({
            where: { sessionToken: payload.oldToken },
            data: {
                sessionToken: payload.newToken,
                ip: payload.ip,
                userAgent: userAgentJson,
                expiresAt: payload.expiresAt,
            }
        });
    }

    async getSessionByUserAndType(userId: string, type?: SessionType): Promise<Session | null> {
        return this.prisma.session.findFirst({
            where: { userId, type },
            orderBy: { createdAt: 'desc' }
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

    async invalidateSession(token: string): Promise<void> {
        await this.prisma.session.update({
            where: { sessionToken: token },
            data: { isActive: false },
        });
    }

    async invalidateUserSessions(userId: string): Promise<void> {
        await this.prisma.session.updateMany({
            where: { userId },
            data: { isActive: false },
        });
    }

    private toUserAgentInfoJson(userAgent: UserAgentInfo): Prisma.JsonObject {
        return {
            browser: userAgent.browser,
            version: userAgent.version,
            os: userAgent.os,
            device: userAgent.device,
            raw: userAgent.raw,
        };
    }

}
