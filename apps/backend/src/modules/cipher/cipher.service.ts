import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CipherRepository } from "./cipher.repository";
import { CipherReason } from "../../generated/prisma/client";
import { logger, ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class CipherService {
    constructor(@inject(TYPES.CipherRepository) private cipherRepository: CipherRepository) { }

    async awardCipher(userId: string, amount: number, reason: CipherReason, sourceId?: string) {
        // Anti-Abuse: Prevent duplicate contest/bounty payouts
        if (sourceId) {
            const hasExisting = await this.cipherRepository.hasTransaction(userId, reason, sourceId);
            if (hasExisting) {
                logger.warn(`User ${userId} already received Cipher for ${reason}:${sourceId}. Skipping.`);
                return;
            }
        }

        return this.cipherRepository.createTransaction({
            userId,
            amount,
            reason,
            sourceId
        });
    }

    async spendCipher(userId: string, amount: number, reason: CipherReason, sourceId?: string) {
        const currentBalance = await this.cipherRepository.getBalance(userId);
        if (currentBalance < amount) {
            throw new ApiError("Insufficient Cipher Balance", StatusCodes.BAD_REQUEST);
        }

        return this.cipherRepository.createTransaction({
            userId,
            amount: -amount,
            reason,
            sourceId
        });
    }

    async getBalance(userId: string): Promise<number> {
        return this.cipherRepository.getBalance(userId);
    }

    async getHistory(userId: string, limit: number = 20, offset: number = 0) {
        return this.cipherRepository.getTransactions(userId, limit, offset);
    }
}
