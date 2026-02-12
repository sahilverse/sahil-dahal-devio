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

        const logsMap = new Map<string, number>();

        user.activityLogs.forEach((log) => {
            const dateStr = log.date.toISOString().split("T")[0]!;
            const currentCount = logsMap.get(dateStr) || 0;
            logsMap.set(dateStr, currentCount + log.count);
        });

        const aggregatedLogs: ActivityLogEntry[] = Array.from(logsMap.entries()).map(
            ([date, count]) => ({ date, count })
        ).sort((a, b) => a.date.localeCompare(b.date));

        return {
            userId: user.id,
            logs: aggregatedLogs,
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

    async logActivity(userId: string, type: ActivityType = ActivityType.PROBLEM_SOLVED): Promise<{ isFirstActivityOfDay: boolean, currentStreak: number }> {
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
            return { isFirstActivityOfDay: true, currentStreak: 1 };
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
            return { isFirstActivityOfDay: true, currentStreak: 1 };
        }

        const lastActiveDate = new Date(lastActive);

        const todayStr = today.toISOString().split("T")[0]!;
        const lastActiveStr = lastActiveDate.toISOString().split("T")[0]!;

        let currentStreak = streak.currentStreak;
        let isFirstActivityOfDay = false;

        if (todayStr === lastActiveStr) {
            isFirstActivityOfDay = false;
        } else {
            // Calculate "Yesterday" in UTC
            const yesterday = new Date(today);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0]!;

            if (lastActiveStr === yesterdayStr) {
                // Consecutive day
                currentStreak += 1;
                isFirstActivityOfDay = true;
                await this.prisma.userStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: currentStreak,
                        longestStreak: Math.max(streak.longestStreak, currentStreak),
                        lastActiveDate: today
                    }
                });
            } else {
                // Streak broken (more than 1 day difference)
                currentStreak = 1;
                isFirstActivityOfDay = true;
                await this.prisma.userStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastActiveDate: today
                    }
                });
            }
        }

        return { isFirstActivityOfDay, currentStreak };
    }
}
