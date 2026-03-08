import { Expose, Type } from "class-transformer";
import { Difficulty } from "../../generated/prisma/client";

export class LabRoomResponseDto {
    @Expose()
    id!: string;

    @Expose()
    title!: string;

    @Expose()
    slug!: string;

    @Expose()
    description!: string;

    @Expose()
    difficulty!: Difficulty;

    @Expose()
    imageUrl?: string | null;

    @Expose()
    estimatedTime?: number | null;

    @Expose()
    pointsReward!: number;

    @Expose()
    isPublished!: boolean;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    @Expose()
    _count?: {
        challenges: number;
        enrollments: number;
    };
}

export class LabEnrollmentResponseDto {
    @Expose()
    id!: string;

    @Expose()
    roomId!: string;

    @Expose()
    userId!: string;

    @Expose()
    progress!: number;

    @Expose()
    isCompleted!: boolean;

    @Expose()
    enrolledAt!: Date;

    @Expose()
    completedAt?: Date | null;
}

export interface GetLabsParamsDto {
    difficulty?: Difficulty;
    isPublished?: boolean | string;
    query?: string;
    skip?: number | string;
    take?: number | string;
}

export class PaginatedLabsResponseDto {
    @Expose()
    @Type(() => LabRoomResponseDto)
    rooms!: LabRoomResponseDto[];

    @Expose()
    total!: number;
}
