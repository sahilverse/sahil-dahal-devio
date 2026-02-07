import { Exclude, Expose, Type } from "class-transformer";

@Exclude()
export class TopicDTO {
    @Expose()
    id!: string;

    @Expose()
    name!: string;

    @Expose()
    slug!: string;

    @Expose()
    count!: number;
}
