import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class SubmissionResultDto {
    @Expose() status!: string;
    @Expose() isPublic!: boolean; // Added for frontend visibility logic
    @Expose() stdout!: string | null;
    @Expose() stderr!: string | null;
    @Expose() compile_output!: string | null;
    @Expose() message!: string | null;
    @Expose() time!: string | null;
    @Expose() memory!: number | null;
}

@Exclude()
export class SubmissionDto {
    @Expose() id!: string;
    @Expose() language!: string;
    @Expose() status!: string;
    @Expose() runtime!: number | null;
    @Expose() memory!: number | null;
    @Expose() score!: number;
    @Expose() error!: string | null;
    @Expose() eventId!: string | null;
    @Expose() createdAt!: Date;

    @Expose()
    @Type(() => SubmissionResultDto)
    results!: SubmissionResultDto[];
}
