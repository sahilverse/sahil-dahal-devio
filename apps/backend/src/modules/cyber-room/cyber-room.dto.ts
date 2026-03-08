import { Expose } from "class-transformer";
import { CTFChallengeType, VMStatus } from "../../generated/prisma/client";

export class CTFChallengeResponseDto {
    @Expose()
    id!: string;

    @Expose()
    roomId!: string;

    @Expose()
    title!: string;

    @Expose()
    description!: string;

    @Expose()
    type!: CTFChallengeType;

    @Expose()
    points!: number;

    @Expose()
    order!: number;

    @Expose()
    hints!: string[];

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    @Expose()
    isSolved?: boolean;
}

export class VMSessionResponseDto {
    @Expose()
    id!: string;

    @Expose()
    userId!: string;

    @Expose()
    roomId?: string | null;

    @Expose()
    instanceId?: string | null;

    @Expose()
    imageId?: string | null;

    @Expose()
    ipAddress?: string | null;

    @Expose()
    status!: VMStatus;

    @Expose()
    expiresAt!: Date;

    @Expose()
    createdAt!: Date;

    @Expose()
    startedAt?: Date | null;
}

export interface CTFSubmissionRequestDto {
    answer: string;
}

export class CTFSubmissionResponseDto {
    @Expose()
    isCorrect!: boolean;

    @Expose()
    message!: string;

    @Expose()
    pointsAwarded?: number;
}
