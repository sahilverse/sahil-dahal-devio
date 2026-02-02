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

        const baseProfile: PublicProfileDTO = {
            id: user.id,
            username: user.username!,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            bio: user.profile?.bio || null,
            city: user.profile?.city || null,
            country: user.profile?.country || null,
            socials: user.profile?.socials,

            auraPoints: user.auraPoints,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            joinedAt: user.createdAt,
            devioAge,
            isFollowing,

            currentStreak: user.userStreak?.currentStreak || 0,
            longestStreak: user.userStreak?.longestStreak || 0,
            activityMap: user.activityLogs,

            achievements: user.userAchievements.map((ua: any) => ua.achievement),
            problemSolvedCount: user._count.submissions,
            roomsCompletedCount: user._count.cyberRoomEnrollments,

            experiences: user.experiences,
            educations: user.educations,
            certifications: user.certifications,
            projects: user.projects,
            skills: user.skills,
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

        if (days < 30) return `${days}d`;

        const months = Math.floor(days / 30);
        if (months < 12) {
            return `${months}m`;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (remainingMonths === 0) {
            return `${years}y`;
        }

        return `${years}y ${remainingMonths}m`;
    }
}
