import { injectable, inject } from "inversify";
import { PrismaClient, ActivityType } from "../../generated/prisma/client";
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
                        type: true
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

    async logActivity(userId: string, type: ActivityType = ActivityType.PROBLEM_SOLVED): Promise<{ isDailyLogin: boolean, currentStreak: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Log the Activity
        await this.prisma.activityLog.upsert({
            where: {
                userId_date_type: {
                    userId,
                    date: today,
                    type
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                userId,
                date: today,
                count: 1,
                type
            }
        });

        // 2. Update Streak
        const streak = await this.prisma.userStreak.findUnique({
            where: { userId }
        });

        if (!streak) {
            await this.prisma.userStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastActiveDate: today
                }
            });
            return { isDailyLogin: true, currentStreak: 1 };
        }

        const lastActive = streak.lastActiveDate;
        if (!lastActive) {
            await this.prisma.userStreak.update({
                where: { userId },
                data: {
                    currentStreak: 1,
                    lastActiveDate: today
                }
            });
            return { isDailyLogin: true, currentStreak: 1 };
        }

        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let currentStreak = streak.currentStreak;
        let isDailyLogin = false;

        if (diffDays === 1) {
            // Consecutive day
            currentStreak += 1;
            isDailyLogin = true;
            await this.prisma.userStreak.update({
                where: { userId },
                data: {
                    currentStreak: currentStreak,
                    longestStreak: Math.max(streak.longestStreak, currentStreak),
                    lastActiveDate: today
                }
            });
        } else if (diffDays > 1) {
            // Streak broken
            currentStreak = 1;
            isDailyLogin = true;
            await this.prisma.userStreak.update({
                where: { userId },
                data: {
                    currentStreak: 1,
                    lastActiveDate: today
                }
            });
        } else {
            // Same day (diffDays === 0)
            isDailyLogin = false;
        }

        return { isDailyLogin, currentStreak };
    }
}
