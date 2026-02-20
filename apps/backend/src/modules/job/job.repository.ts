import { injectable, inject } from "inversify";
import type { PrismaClient, Job, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class JobRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: Prisma.JobCreateInput): Promise<Job> {
        return this.prisma.job.create({ data });
    }

    async findById(id: string): Promise<any | null> {
        return this.prisma.job.findUnique({
            where: { id },
            include: {
                company: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                },
                skills: {
                    include: {
                        skill: true
                    }
                },
                topics: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }

    async findBySlug(slug: string): Promise<any | null> {
        return this.prisma.job.findUnique({
            where: { slug },
            include: {
                company: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                },
                topics: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }

    async findAll(params: {
        companyId?: string;
        isActive?: boolean | string;
        query?: string;
        type?: string;
        skip?: number | string;
        take?: number | string;
    }) {
        const { companyId, isActive, query, type, skip = 0, take = 10 } = params;

        const where: Prisma.JobWhereInput = {
            isActive: typeof isActive === "string" ? isActive === "true" : (isActive ?? true)
        };

        if (companyId) where.companyId = companyId;
        if (type) where.type = type as any;
        if (query) {
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
            ];
        }

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logoUrl: true,
                            isVerified: true,
                            verificationTier: true
                        }
                    }
                },
                skip: Number(skip),
                take: Number(take),
                orderBy: { createdAt: "desc" }
            }),
            this.prisma.job.count({ where })
        ]);

        return { jobs, total };
    }

    async update(id: string, data: Prisma.JobUpdateInput): Promise<Job> {
        return this.prisma.job.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.job.delete({ where: { id } });
    }
}
