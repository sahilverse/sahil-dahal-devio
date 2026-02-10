import { AuraReason } from "../../generated/prisma/client";

export interface CreateAuraTransactionInput {
    userId: string;
    amount: number;
    reason: AuraReason;
    sourceId?: string;
}

export interface AuraTransactionResponse {
    id: string;
    userId: string;
    amount: number;
    reason: AuraReason;
    sourceId?: string | null;
    createdAt: Date;
}

