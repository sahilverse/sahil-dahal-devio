import { Expose } from "class-transformer";

export class LanguageListDto {
    @Expose()
    languages!: string[];
}


