import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { AchievementRepository } from "./achievement.repository";
import { AuraService } from "../aura/aura.service";
import { AuraReason, NotificationType } from "../../generated/prisma/client";
import { NotificationService } from "../notification";
import { logger } from "../../utils";

@injectable()
export class AchievementService {
    constructor(
        @inject(TYPES.AchievementRepository) private achievementRepository: AchievementRepository,
        @inject(TYPES.AuraService) private auraService: AuraService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService
    ) { }

    async checkAndUnlock(userId: string, criteria: string, currentValue: number): Promise<void> {
        const achievements = await this.achievementRepository.findByCriteria(criteria);

        for (const achievement of achievements) {
            // Skip if threshold not met
            if (achievement.threshold && currentValue < achievement.threshold) {
                continue;
            }

            // Skip if already unlocked
            const alreadyUnlocked = await this.achievementRepository.hasAchievement(userId, achievement.id);
            if (alreadyUnlocked) {
                continue;
            }

            // Unlock
            await this.achievementRepository.unlockAchievement(userId, achievement.id);

            // Award Aura
            if (achievement.auraReward > 0) {
                await this.auraService.awardAura(
                    userId,
                    achievement.auraReward,
                    AuraReason.STREAK_MILESTONE,
                    `achievement:${achievement.slug}`
                );
            }

            // Notify User
            await this.notificationService.notify({
                userId,
                type: NotificationType.ACHIEVEMENT_UNLOCKED,
                message: `Congratulations! You've unlocked the "${achievement.name}" achievement!`,
                actionUrl: `/profile/achievements`,
                data: {
                    achievementId: achievement.id,
                    slug: achievement.slug,
                    auraReward: achievement.auraReward
                }
            }).catch(err => logger.error(`Failed to send achievement notification: ${err}`));
        }
    }

    async getUserCount(userId: string, criteria: string): Promise<number> {
        return this.achievementRepository.getUserCriteriaCount(userId, criteria);
    }
}
