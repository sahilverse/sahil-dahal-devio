import { injectable, inject } from "inversify";
import type { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { CompanySearchResponse } from "./company.types";

@injectable()
export class CompanyRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async searchCompanies(query: string, limit: number = 10): Promise<CompanySearchResponse[]> {
        return this.prisma.company.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                name: true,
                logoUrl: true
            },
            take: limit,
            orderBy: {
                name: "asc"
            }
        });
    }
}
