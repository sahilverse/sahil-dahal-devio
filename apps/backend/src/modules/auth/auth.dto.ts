import { Exclude, Expose, Transform } from "class-transformer";

@Exclude()
export class AuthUserDto {
    @Expose() id!: string;
    @Expose() firstName!: string | null;
    @Expose() lastName!: string | null;
    @Expose() username!: string | null;
    @Expose() email!: string;
    @Expose() emailVerified!: Date | null;

    @Expose()
    @Transform(({ value }) => value || null)
    avatarUrl!: string | null;

    @Expose()
    @Transform(({ obj }) => obj.role?.name)
    role!: string;

    @Expose() createdAt!: Date;
}
