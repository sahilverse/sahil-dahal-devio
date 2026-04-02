import { Expose, Type } from "class-transformer";

export enum SearchResultType {
    USER = "user",
    TOPIC = "topic",
    JOB = "job",
    PROBLEM = "problem",
    COMPANY = "company",
    COMMUNITY = "community",
    COURSE = "course"
}

export class SearchResultDTO {
    @Expose() id!: string;
    @Expose() name!: string;
    @Expose() slug!: string;
    @Expose() type!: SearchResultType;
    @Expose() iconUrl!: string | null;
    @Expose() metadata?: any;
}

export class GlobalSearchResponseDTO {
    @Expose()
    @Type(() => SearchResultDTO)
    users!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    topics!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    jobs!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    problems!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    companies!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    communities!: SearchResultDTO[];

    @Expose()
    @Type(() => SearchResultDTO)
    courses!: SearchResultDTO[];
}
