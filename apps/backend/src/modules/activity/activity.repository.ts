import { injectable, inject } from "inversify";
import type { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import type { ActivityLogEntry } from "./activity.types";

@injectable()
export class ActivityRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findByUsernameAndYear(username: string, year: number): Promise<{ userId: string; logs: ActivityLogEntry[] } | null> {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        const user = await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                activityLogs: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        date: true,
                        count: true,
                    },
                    orderBy: {
                        date: "asc",
                    },
                },
            },
        });

        if (!user) return null;

        return {
            userId: user.id,
            logs: user.activityLogs.map((log) => ({
                date: log.date.toISOString().split("T")[0]!,
                count: log.count,
            })),
        };
    }

    async getAvailableYears(username: string): Promise<number[]> {
        const user = await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
            select: {
                createdAt: true,
            },
        });

        if (!user) return [];

        const startYear = user.createdAt.getFullYear();
        const currentYear = new Date().getFullYear();
        const years: number[] = [];

        for (let year = currentYear; year >= startYear; year--) {
            years.push(year);
        }

        return years;
    }
}
