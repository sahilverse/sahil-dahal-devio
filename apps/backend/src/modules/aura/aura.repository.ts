import { injectable, inject } from "inversify";
import type { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CreateAuraTransactionInput, AuraTransactionResponse } from "./aura.types";

@injectable()
export class AuraRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createTransaction(data: CreateAuraTransactionInput): Promise<AuraTransactionResponse> {
        return this.prisma.auraTransaction.create({
            data: {
                userId: data.userId,
                amount: data.amount,
                reason: data.reason,
                sourceId: data.sourceId
            }
        });
    }

    async getPoints(userId: string): Promise<number> {
        const result = await this.prisma.auraTransaction.aggregate({
            where: { userId },
            _sum: {
                amount: true
            }
        });

        return result._sum.amount || 0;
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
