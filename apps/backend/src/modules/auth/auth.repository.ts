import { injectable, inject } from "inversify";
import type { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";


@injectable()
export class AuthRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

}