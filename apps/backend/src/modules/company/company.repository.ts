import { injectable, inject } from "inversify";
import type { PrismaClient, Company, CompanyMember, CompanyRole, Prisma } from "../../generated/prisma/client";
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

    async create(data: Prisma.CompanyCreateInput): Promise<Company> {
        return this.prisma.company.create({ data });
    }

    async findById(id: string): Promise<any | null> {
        return this.prisma.company.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                },
                members: {
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
                    }
                }
            }
        });
    }

    async findBySlug(slug: string): Promise<any | null> {
        return this.prisma.company.findUnique({
            where: { slug },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                },
                members: {
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
                    }
                }
            }
        });
    }

    async update(id: string, data: Prisma.CompanyUpdateInput): Promise<Company> {
        return this.prisma.company.update({
            where: { id },
            data
        });
    }

    async addMember(companyId: string, userId: string, role: CompanyRole): Promise<CompanyMember> {
        return this.prisma.companyMember.create({
            data: {
                companyId,
                userId,
                role
            }
        });
    }

    async findMember(companyId: string, userId: string): Promise<CompanyMember | null> {
        return this.prisma.companyMember.findUnique({
            where: {
                companyId_userId: {
                    companyId,
                    userId
                }
            }
        });
    }

    async updateMemberRole(companyId: string, userId: string, role: CompanyRole): Promise<CompanyMember> {
        return this.prisma.companyMember.update({
            where: {
                companyId_userId: {
                    companyId,
                    userId
                }
            },
            data: { role }
        });
    }

    async removeMember(companyId: string, userId: string): Promise<void> {
        await this.prisma.companyMember.delete({
            where: {
                companyId_userId: {
                    companyId,
                    userId
                }
            }
        });
    }

    async findUserManagedCompanies(userId: string): Promise<Company[]> {
        return this.prisma.company.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        members: {
                            some: {
                                userId,
                                role: { in: ["OWNER", "RECRUITER"] }
                            }
                        }
                    }
                ]
            },
            orderBy: { name: "asc" }
        });
    }
}
