import { Exclude, Expose, Transform, Type } from "class-transformer";
import { Difficulty, ProblemSolutionStatus } from "../../generated/prisma/client";
import { TopicDTO } from "../topic/topic.dto";

@Exclude()
export class CreateProblemDTO {
    @Expose() title!: string;
    @Expose() difficulty!: Difficulty;
    @Expose() description!: string;
    @Expose() publish?: boolean;
    @Expose() topics?: string[];
}

@Exclude()
export class TestCaseDTO {
    @Expose() id!: string;
    @Expose() input!: string;
    @Expose() output!: string;
}

@Exclude()
export class ProblemResponseDTO {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() difficulty!: Difficulty;
    @Expose() description!: string;

    @Expose()
    @Transform(({ obj }) => obj.topics?.map((t: any) => ({
        id: t.topic?.id,
        name: t.topic?.name,
        slug: t.topic?.slug
    })))
    @Type(() => TopicDTO)
    topics!: TopicDTO[];

    @Expose()
    @Transform(({ obj }) => {
        const publicCases = obj.testCases?.filter((tc: any) => tc.isPublic) || [];
        return publicCases.slice(0, 3).map((tc: any) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output
        }));
    })
    @Type(() => TestCaseDTO)
    testCases!: TestCaseDTO[];

    @Expose() createdAt!: Date;
    @Expose() updatedAt!: Date;
}

@Exclude()
export class ProblemListItemDTO {
    @Expose() id!: string;
    @Expose() title!: string;
    @Expose() slug!: string;
    @Expose() difficulty!: Difficulty;

    @Expose()
    @Transform(({ obj }) => obj.topics?.map((t: any) => ({
        name: t.topic?.name,
        slug: t.topic?.slug
    })))
    @Type(() => TopicDTO)
    topics!: TopicDTO[];

    @Expose()
    @Transform(({ obj }) => {
        if (!obj.userStatuses || obj.userStatuses.length === 0) return ProblemSolutionStatus.UNSOLVED;
        return obj.userStatuses[0].status;
    })
    status!: ProblemSolutionStatus;

    @Expose() createdAt!: Date;
}

@Exclude()
export class PaginatedProblemsResponseDTO {
    @Expose()
    @Type(() => ProblemListItemDTO)
    items!: ProblemListItemDTO[];

    @Expose() nextCursor!: string | null;
}
