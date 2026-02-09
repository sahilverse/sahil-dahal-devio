import { Expose } from "class-transformer";
import { z } from "zod";

// Response DTOs
export class ExecutionResultDto {
    @Expose()
    sessionId!: string;

    @Expose()
    stdout!: string;

    @Expose()
    stderr!: string;

    @Expose()
    executionTime!: number;
}

export class LanguageListDto {
    @Expose()
    languages!: string[];
}


