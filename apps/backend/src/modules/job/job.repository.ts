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
                }
            }
        });
    }

    async findAll(params: {
        companyId?: string;
        isActive?: boolean;
        query?: string;
        skip?: number;
        take?: number;
    }) {
        const { companyId, isActive, query, skip = 0, take = 10 } = params;

        const where: Prisma.JobWhereInput = {
            isActive: isActive ?? true
        };

        if (companyId) where.companyId = companyId;
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
                            logoUrl: true,
                            isVerified: true,
                            verificationTier: true
                        }
                    }
                },
                skip,
                take,
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
