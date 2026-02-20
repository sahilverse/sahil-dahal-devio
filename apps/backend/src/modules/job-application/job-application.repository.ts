import { injectable, inject } from "inversify";
import type { PrismaClient, JobApplication, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class JobApplicationRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: Prisma.JobApplicationCreateInput): Promise<JobApplication> {
        return this.prisma.jobApplication.create({ data });
    }

    async findById(id: string): Promise<any | null> {
        return this.prisma.jobApplication.findUnique({
            where: { id },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                name: true,
                                logoUrl: true
                            }
                        }
                    }
                },
                user: {
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

    async findByJobAndUser(jobId: string, userId: string): Promise<JobApplication | null> {
        return this.prisma.jobApplication.findUnique({
            where: {
                jobId_userId: {
                    jobId,
                    userId
                }
            }
        });
    }

    async findByUserId(userId: string): Promise<JobApplication[]> {
        return this.prisma.jobApplication.findMany({
            where: { userId },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                name: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { appliedAt: "desc" }
        });
    }

    async findByJobId(jobId: string): Promise<JobApplication[]> {
        return this.prisma.jobApplication.findMany({
            where: { jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { appliedAt: "desc" }
        });
    }

    async update(id: string, data: Prisma.JobApplicationUpdateInput): Promise<JobApplication> {
        return this.prisma.jobApplication.update({
            where: { id },
            data
        });
    }
}
