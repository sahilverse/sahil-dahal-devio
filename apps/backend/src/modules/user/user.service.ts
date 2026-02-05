import { injectable, inject } from "inversify";
import { UserRepository } from "./user.repository";
import { ApiError } from "../../utils/ApiError";
import type { User } from "../../generated/prisma/client";
import type { OnboardingPayload, UserProfile } from "./user.types";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { PrivateProfileDTO, PublicProfileDTO } from "./dtos/user.dto";

@injectable()
export class UserService {
    constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) { }

    async completeOnboarding(userId: string, payload: OnboardingPayload): Promise<User> {
        const existingUser = await this.userRepository.findByUsername(payload.username);
        if (existingUser && existingUser.id !== userId) {
            throw new ApiError("Username already taken", StatusCodes.CONFLICT);
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            username: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName,
        });

        return updatedUser;
    }

    async getUserById(userId: string): Promise<User | null> {
        return this.userRepository.findById(userId);
    }

    async getProfile(username: string, viewerId?: string): Promise<PublicProfileDTO | PrivateProfileDTO> {
        const user = await this.userRepository.findProfileByUsername(username) as UserProfile;
        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const isOwner = viewerId === user.id;
        let isFollowing = false;

        if (viewerId && !isOwner) {
            isFollowing = await this.userRepository.isFollowing(viewerId, user.id);
        }

        // Calculate Devio Age
        const joinedAt = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const devioAge = this.formatDevioAge(diffDays);
        const weeklyContributions = await this.userRepository.getWeeklyContributions(user.id);

        const baseProfile: PublicProfileDTO = {
            id: user.id,
            username: user.username!,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            title: user.profile?.title || null,
            city: user.profile?.city || null,
            country: user.profile?.country || null,
            socials: (user.profile?.socials as Record<string, string>) || null,
            contributions: weeklyContributions,

            auraPoints: user.auraPoints,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            joinedAt: user.createdAt,
            devioAge,
            isFollowing,

            currentStreak: user.userStreak?.currentStreak || 0,
            longestStreak: user.userStreak?.longestStreak || 0,
            activityMap: user.activityLogs.filter((log) => {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                return new Date(log.date) >= oneYearAgo;
            }),

            achievements: user.userAchievements.map((ua: any) => ua.achievement),

            problemStats: this.calculateProblemStats(user.submissions),
            roomStats: this.calculateRoomStats(user.cyberRoomEnrollments),
            recentActivity: this.getRecentActivity(user.submissions, user.cyberRoomEnrollments),

            experiences: user.experiences.map((exp) => ({
                id: exp.id,
                title: exp.title,
                companyName: exp.companyName,
                companyLogoUrl: exp.company?.logoUrl || null,
                location: exp.location,
                type: exp.type,
                startDate: exp.startDate,
                endDate: exp.endDate,
                isCurrent: exp.isCurrent,
                description: exp.description,
            })),
            educations: user.educations,
            certifications: user.certifications,
            projects: user.projects,
            skills: user.skills.map((us) => ({
                id: us.skill.id,
                name: us.skill.name,
                slug: us.skill.slug,
            })),
        };

        if (isOwner) {
            return {
                ...baseProfile,
                cipherBalance: user.cipherBalance,
                accountStatus: user.accountStatus,
            } as PrivateProfileDTO;
        }

        return baseProfile;
    }

    async followUser(targetUsername: string, followerId: string): Promise<void> {
        const targetUser = await this.userRepository.findByUsername(targetUsername);
        if (!targetUser) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (targetUser.id === followerId) {
            throw new ApiError("Cannot follow yourself", StatusCodes.BAD_REQUEST);
        }

        const isAlreadyFollowing = await this.userRepository.isFollowing(followerId, targetUser.id);
        if (isAlreadyFollowing) {
            throw new ApiError("Already following", StatusCodes.CONFLICT);
        }

        await this.userRepository.followUser(followerId, targetUser.id);

        // TODO: Trigger notification
    }

    async unfollowUser(targetUsername: string, followerId: string): Promise<void> {
        const targetUser = await this.userRepository.findByUsername(targetUsername);
        if (!targetUser) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        await this.userRepository.unfollowUser(followerId, targetUser.id);
    }

    private formatDevioAge(days: number): string {
        if (days === 0) return "Just joined";

        if (days < 30) return `${days} d`;

        const months = Math.floor(days / 30);
        if (months < 12) {
            return `${months} m`;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (remainingMonths === 0) {
            return `${years} y`;
        }

        return `${years} y ${remainingMonths} m`;
    }

    private calculateProblemStats(submissions: any[]) {
        const stats = { total: 0, easy: 0, medium: 0, hard: 0 };
        if (!submissions) return stats;

        submissions.forEach((s) => {
            stats.total++;
            const diff = s.problem?.difficulty;
            if (diff === 'EASY') stats.easy++;
            else if (diff === 'MEDIUM') stats.medium++;
            else if (diff === 'HARD') stats.hard++;
        });
        return stats;
    }

    private calculateRoomStats(enrollments: any[]) {
        const stats = { total: 0, easy: 0, medium: 0, hard: 0 };
        if (!enrollments) return stats;

        enrollments.forEach((e) => {
            stats.total++;
            const diff = e.room?.difficulty;
            if (diff === 'EASY') stats.easy++;
            else if (diff === 'MEDIUM') stats.medium++;
            else if (diff === 'HARD') stats.hard++;
        });
        return stats;
    }

    private getRecentActivity(submissions: any[], enrollments: any[]) {
        const problems = (submissions || []).map((s) => ({
            id: s.problem.id,
            title: s.problem.title,
            slug: s.problem.slug,
            difficulty: s.problem.difficulty,
            completedAt: s.createdAt,
            type: 'PROBLEM' as const
        }));

        const rooms = (enrollments || []).map((e) => ({
            id: e.room.id,
            title: e.room.title,
            slug: e.room.slug,
            difficulty: e.room.difficulty,
            completedAt: e.completedAt,
            type: 'ROOM' as const
        }));

        return [...problems, ...rooms]
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .slice(0, 5);
    }
}
