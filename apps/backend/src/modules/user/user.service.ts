import { injectable, inject } from "inversify";
import { UserRepository } from "./user.repository";
import { ApiError } from "../../utils/ApiError";
import type { User } from "../../generated/prisma/client";
import { AccountStatus } from "../../generated/prisma/client";
import type {
    OnboardingPayload,
    UserProfile,
    UpdateProfilePayload,
    UpdateNamesPayload,
    CreateExperiencePayload,
    UpdateExperiencePayload,
    CreateEducationPayload,
    UpdateEducationPayload,
    CreateCertificationPayload,
    UpdateCertificationPayload,
    CreateProjectPayload,
    UpdateProjectPayload
} from "./user.types";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { PrivateProfileDTO, PublicProfileDTO } from "./user.dto";
import { StorageService } from "../storage";
import { SkillService } from "../skill";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { AuthUserDto } from "../auth";
import { plainToInstance } from "class-transformer";
import { CommunityRepository, GetJoinedCommunitiesResponseDto } from "../community";

@injectable()
export class UserService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.SkillService) private skillService: SkillService,
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository
    ) { }

    async completeOnboarding(userId: string, payload: OnboardingPayload): Promise<AuthUserDto> {
        const existingUser = await this.userRepository.findByUsername(payload.username);
        if (existingUser && existingUser.id !== userId) {
            throw new ApiError({ "username": "Username already taken" }, StatusCodes.CONFLICT);
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            username: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName,
        });

        return plainToInstance(AuthUserDto, updatedUser, { excludeExtraneousValues: true });
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

        const restrictedStatuses: AccountStatus[] = [
            AccountStatus.DEACTIVATED,
            AccountStatus.SUSPENDED,
            AccountStatus.ADMIN_DISABLED,
            AccountStatus.PENDING_DELETION,
        ];

        if (restrictedStatuses.includes(user.accountStatus) && !isOwner) {
            throw new ApiError("This account is not available", StatusCodes.NOT_FOUND);
        }

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

        const activityMap = user.activityLogs.filter((log) => {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return new Date(log.date) >= oneYearAgo;
        });

        const achievements = {
            latest: user.userAchievements.map((ua: any) => ua.achievement),
            total: user._count.userAchievements,
        };

        const problemStats = this.calculateProblemStats(user.submissions);
        const roomStats = this.calculateRoomStats(user.cyberRoomEnrollments);
        const recentActivity = this.getRecentActivity(user.submissions, user.cyberRoomEnrollments);

        const experiences = user.experiences.map((exp) => ({
            ...exp,
            companyLogoUrl: exp.company?.logoUrl || null,
        }));

        const skills = user.skills.map((us) => ({
            id: us.skill.id,
            name: us.skill.name,
            slug: us.skill.slug,
        }));

        const plainProfile = {
            ...user,
            title: user.profile?.title || null,
            city: user.profile?.city || null,
            country: user.profile?.country || null,
            socials: user.profile?.socials ? this.filterSocials(user.profile.socials as Record<string, string | null>) : null,
            contributions: weeklyContributions,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            joinedAt: user.createdAt,
            devioAge,
            isFollowing,
            isOwner,
            currentStreak: user.userStreak?.currentStreak || 0,
            longestStreak: user.userStreak?.longestStreak || 0,
            activityMap,
            achievements,
            problemStats,
            roomStats,
            recentActivity,
            experiences,
            skills,
        };

        if (isOwner) {
            return plainToInstance(PrivateProfileDTO, plainProfile, { excludeExtraneousValues: true });
        }

        return plainToInstance(PublicProfileDTO, plainProfile, { excludeExtraneousValues: true });
    }

    async getJoinedCommunities(userId: string, limit: number, cursor?: string, query?: string): Promise<GetJoinedCommunitiesResponseDto> {
        const members = await this.communityRepository.findJoinedCommunities(userId, limit, cursor, query);

        let nextCursor: string | null = null;
        if (members.length > limit) {
            const nextItem = members.pop();
            nextCursor = nextItem?.id || null;
        }

        const communities = members.map((member: any) => ({
            id: member.community.id,
            name: member.community.name,
            iconUrl: member.community.iconUrl,
            memberCount: member.community._count.members,
        }));

        return plainToInstance(GetJoinedCommunitiesResponseDto, {
            communities,
            nextCursor
        }, { excludeExtraneousValues: true });
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

    async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (user.avatarUrl) {
            await this.storageService.deleteFile(user.avatarUrl);
        }

        const datePath = format(new Date(), "yyyy/MM/dd");
        const filename = `${uuidv4()}.webp`;
        const path = `avatars/${datePath}/${filename}`;

        const imageUrl = await this.storageService.uploadFile(file, path);
        await this.userRepository.updateProfilePicture(userId, imageUrl);

        return imageUrl;
    }

    async updateBanner(userId: string, file: Express.Multer.File): Promise<string> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (user.bannerUrl) {
            await this.storageService.deleteFile(user.bannerUrl);
        }

        const datePath = format(new Date(), "yyyy/MM/dd");
        const filename = `${uuidv4()}.webp`;
        const path = `banners/${datePath}/${filename}`;

        const imageUrl = await this.storageService.uploadFile(file, path);
        await this.userRepository.updateBannerPicture(userId, imageUrl);

        return imageUrl;
    }

    async removeAvatar(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (user.avatarUrl) {
            await this.storageService.deleteFile(user.avatarUrl);
        }

        await this.userRepository.removeAvatar(userId);
    }

    async removeBanner(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);

        if (user.bannerUrl) {
            await this.storageService.deleteFile(user.bannerUrl);
        }

        await this.userRepository.removeBanner(userId);
    }

    async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        if (payload.socials) {
            payload.socials = this.filterSocials(payload.socials);
        }

        await this.userRepository.updateProfileDetails(userId, payload);
    }

    async updateNames(userId: string, payload: UpdateNamesPayload): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.updateUserProfile(userId, payload);
    }

    async addExperience(userId: string, data: CreateExperiencePayload): Promise<any> {
        return this.userRepository.createExperience(userId, data);
    }

    async updateExperience(userId: string, experienceId: string, data: UpdateExperiencePayload): Promise<any> {
        const experience = await this.userRepository.findExperienceById(experienceId);
        if (!experience) {
            throw new ApiError("Experience not found", StatusCodes.NOT_FOUND);
        }

        return this.userRepository.updateExperience(userId, experienceId, data);
    }

    async deleteExperience(userId: string, experienceId: string): Promise<void> {
        const experience = await this.userRepository.findExperienceById(experienceId);
        if (!experience) {
            throw new ApiError("Experience not found", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.deleteExperience(userId, experienceId);
    }

    async addEducation(userId: string, data: CreateEducationPayload): Promise<any> {
        return this.userRepository.createEducation(userId, data);
    }

    async updateEducation(userId: string, educationId: string, data: UpdateEducationPayload): Promise<any> {
        const education = await this.userRepository.findEducationById(educationId);
        if (!education) {
            throw new ApiError("Education not found", StatusCodes.NOT_FOUND);
        }

        return this.userRepository.updateEducation(userId, educationId, data);
    }

    async deleteEducation(userId: string, educationId: string): Promise<void> {
        const education = await this.userRepository.findEducationById(educationId);
        if (!education) {
            throw new ApiError("Education not found", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.deleteEducation(userId, educationId);
    }

    async addSkill(userId: string, name: string): Promise<any> {
        const skill = await this.skillService.createSkill(name);

        const existingUserSkill = await this.userRepository.findUserSkill(userId, skill.id);
        if (existingUserSkill) {
            throw new ApiError("Skill already added", StatusCodes.CONFLICT);
        }

        const userSkill = await this.userRepository.addUserSkill(userId, skill.id);
        return {
            id: userSkill.skill.id,
            name: userSkill.skill.name,
            slug: userSkill.skill.slug
        };
    }

    async removeSkill(userId: string, skillId: string): Promise<void> {
        const userSkill = await this.userRepository.findUserSkill(userId, skillId);
        if (!userSkill) {
            throw new ApiError("Skill not found for user", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.removeUserSkill(userId, skillId);
    }

    async addCertification(userId: string, data: CreateCertificationPayload): Promise<any> {
        return this.userRepository.createCertification(userId, data);
    }

    async updateCertification(userId: string, certificationId: string, data: UpdateCertificationPayload): Promise<any> {
        const certification = await this.userRepository.findCertificationById(certificationId);
        if (!certification || certification.userId !== userId) {
            throw new ApiError("Certification not found", StatusCodes.NOT_FOUND);
        }

        return this.userRepository.updateCertification(userId, certificationId, data);
    }

    async removeCertification(userId: string, certificationId: string): Promise<void> {
        const certification = await this.userRepository.findCertificationById(certificationId);
        if (!certification || certification.userId !== userId) {
            throw new ApiError("Certification not found", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.deleteCertification(userId, certificationId);
    }

    async addProject(userId: string, data: CreateProjectPayload): Promise<any> {
        return this.userRepository.createProject(userId, data);
    }

    async updateProject(userId: string, projectId: string, data: UpdateProjectPayload): Promise<any> {
        const project = await this.userRepository.findProjectById(projectId);
        if (!project || project.userId !== userId) {
            throw new ApiError("Project not found", StatusCodes.NOT_FOUND);
        }

        return this.userRepository.updateProject(userId, projectId, data);
    }

    async deleteProject(userId: string, projectId: string): Promise<void> {
        const project = await this.userRepository.findProjectById(projectId);
        if (!project || project.userId !== userId) {
            throw new ApiError("Project not found", StatusCodes.NOT_FOUND);
        }

        await this.userRepository.deleteProject(userId, projectId);
    }


    private filterSocials(socials: Record<string, any>): Record<string, string> {
        return Object.fromEntries(
            Object.entries(socials).filter(([_, value]) => value !== null && value !== "")
        );
    }
}
