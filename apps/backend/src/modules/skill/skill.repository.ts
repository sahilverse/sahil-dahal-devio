import { injectable, inject } from "inversify";
import type { PrismaClient, Skill } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class SkillRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(name: string, slug: string): Promise<Skill> {
        return this.prisma.skill.create({
            data: {
                name,
                slug
            }
        });
    }

    async findByName(name: string): Promise<Skill | null> {
        return this.prisma.skill.findUnique({
            where: { name }
        });
    }

    async findBySlug(slug: string): Promise<Skill | null> {
        return this.prisma.skill.findUnique({
            where: { slug }
        });
    }

    async search(query: string, limit: number = 10): Promise<Skill[]> {
        return this.prisma.skill.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { slug: { contains: query, mode: "insensitive" } }
                ]
            },
            take: limit,
            orderBy: {
                name: "asc"
            }
        });
    }
}
