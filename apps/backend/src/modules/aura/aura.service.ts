import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { AuraRepository } from "./aura.repository";
import { AuraReason } from "../../generated/prisma/client";
import { logger } from "../../utils";

@injectable()
export class AuraService {
    constructor(@inject(TYPES.AuraRepository) private auraRepository: AuraRepository) { }

    async awardAura(userId: string, amount: number, reason: AuraReason, sourceId?: string) {
        if (amount <= 0) {
            logger.warn(`Attempted to award non-positive Aura: ${amount} to user ${userId}`);
            return;
        }

        return this.auraRepository.createTransaction({
            userId,
            amount,
            reason,
            sourceId
        });
    }

    async getPoints(userId: string): Promise<number> {
        return this.auraRepository.getPoints(userId);
    }

    async getHistory(userId: string, limit: number = 20, offset: number = 0) {
        return this.auraRepository.getTransactions(userId, limit, offset);
    }
}
