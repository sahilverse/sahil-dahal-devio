import { injectable, inject } from "inversify";
import type { AuraReason, PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CreateAuraTransactionInput, AuraTransactionResponse } from "./aura.types";

@injectable()
export class AuraRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createTransaction(data: CreateAuraTransactionInput): Promise<AuraTransactionResponse> {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Transaction Record
            const transaction = await tx.auraTransaction.create({
                data: {
                    userId: data.userId,
                    amount: data.amount,
                    reason: data.reason,
                    sourceId: data.sourceId
                }
            });

            // 2. Atomically Update User's Aura Points
            await tx.user.update({
                where: { id: data.userId },
                data: {
                    auraPoints: {
                        increment: data.amount
                    }
                }
            });

            return transaction;
        });
    }

    async getPoints(userId: string): Promise<number> {
        // Optimized: Read from User table directly
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { auraPoints: true }
        });
        return user?.auraPoints || 0;
    }

    async hasTransaction(userId: string, reason: AuraReason, sourceId: string): Promise<boolean> {
        // Anti-Abuse: Check if a transaction exists for this reason/source
        const count = await this.prisma.auraTransaction.count({
            where: {
                userId,
                reason: reason,
                sourceId
            }
        });
        return count > 0;
    }

    async getTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<AuraTransactionResponse[]> {
        return this.prisma.auraTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
    }
}
