import { injectable, inject } from "inversify";
import { PrismaClient, CipherReason } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class CipherRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createTransaction(data: {
        userId: string;
        amount: number;
        reason: CipherReason;
        sourceId?: string;
    }) {
        const { userId, amount, reason, sourceId } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Ledger Entry
            const transaction = await tx.cipherTransaction.create({
                data: {
                    userId,
                    amount,
                    reason,
                    sourceId
                }
            });

            // 2. Update User Balance (Atomic Increment)
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    cipherBalance: {
                        increment: amount
                    }
                },
                select: { cipherBalance: true }
            });

            return { transaction, newBalance: updatedUser.cipherBalance };
        });
    }

    async getBalance(userId: string): Promise<number> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { cipherBalance: true }
        });
        return user?.cipherBalance || 0;
    }

    async getTransactions(userId: string, limit: number, offset: number) {
        return this.prisma.cipherTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset
        });
    }

    // Check if a transaction exists (Anti-Abuse)
    async hasTransaction(userId: string, reason: CipherReason, sourceId: string): Promise<boolean> {
        const count = await this.prisma.cipherTransaction.count({
            where: {
                userId,
                reason,
                sourceId
            }
        });
        return count > 0;
    }
}
