import { injectable, inject } from "inversify";
import { ActivityRepository } from "./activity.repository";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import type { ActivityDataResponse } from "./activity.types";
import { AuraService } from "../aura/aura.service";
import { AchievementService } from "../achievement/achievement.service";
import { ActivityType, AuraReason } from "../../generated/prisma/client";

@injectable()
export class ActivityService {
    constructor(
        @inject(TYPES.ActivityRepository) private activityRepository: ActivityRepository,
        @inject(TYPES.AuraService) private auraService: AuraService,
        @inject(TYPES.AchievementService) private achievementService: AchievementService
    ) { }

    async getActivityByYear(username: string, year: number): Promise<ActivityDataResponse> {
        const currentYear = new Date().getFullYear();

        if (year > currentYear) {
            throw new ApiError("Cannot fetch future activity data", StatusCodes.BAD_REQUEST);
        }

        if (year < currentYear - 10) {
            throw new ApiError("Activity data is only available for the last 10 years", StatusCodes.BAD_REQUEST);
        }

        const result = await this.activityRepository.findByUsernameAndYear(username, year);

        if (!result) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const totalActivities = result.logs.reduce((sum, log) => sum + log.count, 0);

        return {
            year,
            activityMap: result.logs,
            totalActivities,
        };
    }

    async getAvailableYears(username: string): Promise<number[]> {
        const years = await this.activityRepository.getAvailableYears(username);

        if (years.length === 0) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return years;
    }

    async logActivity(userId: string, type: ActivityType = ActivityType.PROBLEM_SOLVED): Promise<void> {
        const { isFirstActivityOfDay, currentStreak } = await this.activityRepository.logActivity(userId, type);

        if (isFirstActivityOfDay) {
            // Award Daily Activity Bonus
            await this.auraService.awardAura(userId, 5, AuraReason.DAILY_ACTIVITY);
        }

        // Check Streak Achievements
        await this.achievementService.checkAndUnlock(userId, "STREAK_DAYS", currentStreak);

        // Check Activity-Specific Achievements
        const criteriaMap: Record<string, string> = {
            PROBLEM_SOLVED: "PROBLEM_SOLVED",
            POST_CREATE: "POSTS_CREATED",
            COMMENT_CREATE: "COMMENTS_CREATED",
            COMMUNITY_CREATE: "COMMUNITY_CREATED",
        };

        const criteria = criteriaMap[type];
        if (criteria) {
            const count = await this.achievementService.getUserCount(userId, criteria);
            await this.achievementService.checkAndUnlock(userId, criteria, count);
        }
    }
}

