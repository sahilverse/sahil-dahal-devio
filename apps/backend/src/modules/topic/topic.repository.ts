import { injectable, inject } from "inversify";
import type { PrismaClient, Topic } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class TopicRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(name: string, slug: string): Promise<Topic> {
        return this.prisma.topic.create({
            data: {
                name,
                slug
            }
        });
    }

    async findByName(name: string): Promise<Topic | null> {
        return this.prisma.topic.findUnique({
            where: { name }
        });
    }

    async findBySlug(slug: string): Promise<Topic | null> {
        return this.prisma.topic.findUnique({
            where: { slug }
        });
    }

    async search(query: string, limit: number = 10): Promise<Topic[]> {
        return this.prisma.topic.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { slug: { contains: query, mode: "insensitive" } }
                ]
            },
            take: limit,
            orderBy: {
                postCount: "desc"
            }
        });
    }
}
