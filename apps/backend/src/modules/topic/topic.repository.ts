import { injectable, inject } from "inversify";
import { PrismaClient, Topic, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class TopicRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(name: string, slug: string, tx?: Prisma.TransactionClient): Promise<Topic> {
        const client = tx || this.prisma;
        return client.topic.create({
            data: {
                name,
                slug
            }
        });
    }

    async findByName(name: string): Promise<Topic | null> {
        return this.prisma.topic.findUnique({
            where: { name },
            include: {
                _count: {
                    select: {
                        posts: true,
                        communities: true,
                        jobs: true,
                        courses: true
                    }
                }
            }
        });
    }

    async findBySlug(slug: string, tx?: Prisma.TransactionClient): Promise<Topic | null> {
        const client = tx || this.prisma;
        return client.topic.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        posts: true,
                        communities: true,
                        jobs: true,
                        courses: true
                    }
                }
            }
        });
    }

    async search(query: string, limit: number = 10): Promise<(Topic & { count: number })[]> {
        const searchTerm = `%${query}%`;

        return this.prisma.$queryRaw`
            SELECT 
                t.*,
                (
                    (SELECT COUNT(*)::int FROM "PostTopic" pt WHERE pt.topic_id = t.id) +
                    (SELECT COUNT(*)::int FROM "CommunityTopic" ct WHERE ct.topic_id = t.id) +
                    (SELECT COUNT(*)::int FROM "JobTopic" jt WHERE jt.topic_id = t.id) +
                    (SELECT COUNT(*)::int FROM "CourseTopic" crt WHERE crt.topic_id = t.id)
                ) as count
            FROM "Topic" t
            WHERE t.name ILIKE ${searchTerm} OR t.slug ILIKE ${searchTerm}
            ORDER BY count DESC, t.name ASC
            LIMIT ${limit}
        `;
    }
}
