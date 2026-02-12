import { injectable, inject } from "inversify";
import { PrismaClient } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class AchievementRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findByCriteria(criteria: string) {
        return this.prisma.achievement.findMany({
            where: { criteria },
            orderBy: { threshold: "asc" }
        });
    }


    async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
        const existing = await this.prisma.userAchievement.findFirst({
            where: { userId, achievementId }
        });
        return !!existing;
    }

    async unlockAchievement(userId: string, achievementId: string) {
        return this.prisma.userAchievement.create({
            data: { userId, achievementId }
        });
    }

    async getUserCriteriaCount(userId: string, criteria: string): Promise<number> {
        switch (criteria) {
            case "PROBLEM_SOLVED":
                return this.prisma.submission.count({
                    where: { userId, status: "ACCEPTED" }
                });

            case "EASY_SOLVED":
                return this.prisma.submission.count({
                    where: { userId, status: "ACCEPTED", problem: { difficulty: "EASY" } }
                });

            case "MEDIUM_SOLVED":
                return this.prisma.submission.count({
                    where: { userId, status: "ACCEPTED", problem: { difficulty: "MEDIUM" } }
                });

            case "HARD_SOLVED":
                return this.prisma.submission.count({
                    where: { userId, status: "ACCEPTED", problem: { difficulty: "HARD" } }
                });

            case "POSTS_CREATED":
                return this.prisma.post.count({
                    where: { authorId: userId }
                });

            case "COMMENTS_CREATED":
                return this.prisma.comment.count({
                    where: { authorId: userId }
                });

            case "COMMUNITY_CREATED":
                return this.prisma.community.count({
                    where: { createdById: userId }
                });

            case "USERS_FOLLOWED":
                return this.prisma.follow.count({
                    where: { followerId: userId }
                });

            case "AURA_POINTS": {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { auraPoints: true }
                });
                return user?.auraPoints ?? 0;
            }

            case "STREAK_DAYS": {
                const streak = await this.prisma.userStreak.findUnique({
                    where: { userId },
                    select: { currentStreak: true }
                });
                return streak?.currentStreak ?? 0;
            }

            default:
                return 0;
        }
    }
}
