import { injectable, inject } from "inversify";
import type { User, PrismaClient, AccountStatusHistory, Community } from "../../generated/prisma/client";
import type {
    CreateUserPayload,
    AccountStatusPayload,
    CreateOAuthUserPayload,
    CreateAccountPayload,
    UpdateProfilePayload,
    CreateExperiencePayload,
    UpdateExperiencePayload,
    CreateEducationPayload,
    UpdateEducationPayload,
    CreateCertificationPayload,
    UpdateCertificationPayload,
    CreateProjectPayload,
    UpdateProjectPayload
} from "./user.types";
import { TYPES } from "../../types";


@injectable()
export class UserRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async createUser(payload: CreateUserPayload, emailVerified: Date | null = null): Promise<User> {
        return await this.prisma.user.create({
            data: {
                ...payload,
                emailVerified
            },
        });
    }

    async createUserOAuthAccount(payload: CreateAccountPayload): Promise<void> {
        await this.prisma.account.create({
            data: {
                userId: payload.userId,
                provider: payload.provider,
                providerAccountId: payload.providerAccountId,
                id_token: payload.id_token,
            },
        });
    }

    async createOAuthUser(payload: CreateOAuthUserPayload): Promise<User> {

        const result = await this.prisma.$transaction(async (prisma) => {
            const { provider, providerAccountId, id_token, userId, ...userData } = payload;

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    emailVerified: new Date(),
                },
            });

            await prisma.account.create({
                data: {
                    userId: user.id,
                    provider,
                    providerAccountId,
                    id_token,
                },
            });

            return user;
        });

        return result;

    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            },
        });
    }

    async findByEmailOrUsername(identifier: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: identifier, mode: "insensitive" } },
                    { username: { equals: identifier, mode: "insensitive" } },
                ],
            },
            include: { role: true },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id },
        });
    }

    async updateUserName(identifier: string, newUsername: string): Promise<void> {
        await this.prisma.user.updateMany({
            where: {
                OR: [
                    { email: { equals: identifier, mode: "insensitive" } },
                    { username: { equals: identifier, mode: "insensitive" } },
                ],
            },
            data: { username: newUsername },
        });
    }

    async updateUserNamebyId(userId: string, newUsername: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { username: newUsername },
        });
    }

    async updatePassword(userId: string, password: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password },
        });
    }


    async markEmailAsVerified(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: new Date()
            }
        });
    }

    async updateProfilePicture(userId: string, imageUrl: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                avatarUrl: imageUrl
            }
        });
    }

    async updateBannerPicture(userId: string, imageUrl: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                bannerUrl: imageUrl
            }
        });
    }

    async removeAvatar(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                avatarUrl: null
            }
        });
    }

    async removeBanner(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                bannerUrl: null
            }
        });
    }

    async setLastLogin(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastLogin: new Date()
            }
        });
    }

    async updateUserRole(userId: string, roleId: number): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                roleId
            }
        });
    }

    async updateAccountStatus(payload: AccountStatusPayload): Promise<void> {
        const { userId, status, reason, performedBy } = payload;
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { accountStatus: status }
            }),
            this.prisma.accountStatusHistory.create({
                data: {
                    userId,
                    status,
                    reason,
                    performedBy,
                }
            })
        ]);
    }

    async getLastAccountStatusHistory(userId: string): Promise<AccountStatusHistory | null> {
        const history = await this.prisma.accountStatusHistory.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        return history;
    }

    async updateUserProfile(userId: string, data: { username?: string; firstName?: string; lastName?: string }): Promise<User> {
        return await this.prisma.user.update({
            where: { id: userId },
            data
        });
    }

    async updateProfileDetails(userId: string, data: UpdateProfilePayload): Promise<void> {
        await this.prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                title: data.title,
                city: data.city,
                country: data.country,
                socials: data.socials as any,
            },
            update: {
                title: data.title,
                city: data.city,
                country: data.country,
                socials: data.socials as any,
            },
        });
    }


    async findProfileByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            },
            include: {
                profile: true,
                role: true,
                userStreak: true,
                userAchievements: {
                    include: { achievement: true },
                    orderBy: { unlockedAt: 'desc' },
                    take: 3
                },
                activityLogs: {
                    where: {
                        date: {
                            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                        }
                    },
                    orderBy: { date: 'asc' }
                },
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        userAchievements: true
                    }
                },
                submissions: {
                    where: { status: "ACCEPTED" },
                    select: {
                        createdAt: true,
                        problem: {
                            select: { id: true, title: true, slug: true, difficulty: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                cyberRoomEnrollments: {
                    where: { completedAt: { not: null } },
                    select: {
                        completedAt: true,
                        room: {
                            select: { id: true, title: true, slug: true, difficulty: true }
                        }
                    },
                    orderBy: { completedAt: 'desc' }
                }
            }
        });
    }

    async findAboutProfileByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                experiences: { orderBy: { startDate: 'desc' }, include: { company: true } },
                educations: { orderBy: { startDate: 'desc' } },
                certifications: { orderBy: { issueDate: 'desc' } },
                projects: { orderBy: { startDate: 'desc' } },
                skills: {
                    include: {
                        skill: true
                    }
                }
            }
        }) as any;
    }

    async followUser(followerId: string, followingId: string): Promise<void> {
        await this.prisma.follow.create({
            data: {
                followerId,
                followingId
            }
        });
    }

    async unfollowUser(followerId: string, followingId: string): Promise<void> {
        await this.prisma.follow.deleteMany({
            where: {
                followerId,
                followingId
            }
        });
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const count = await this.prisma.follow.count({
            where: {
                followerId,
                followingId
            }
        });
        return count > 0;
    }
    async getWeeklyContributions(userId: string): Promise<{ total: number; posts: number; comments: number }> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [posts, comments] = await Promise.all([
            this.prisma.post.count({
                where: {
                    authorId: userId,
                    createdAt: {
                        gte: sevenDaysAgo
                    }
                }
            }),
            this.prisma.comment.count({
                where: {
                    authorId: userId,
                    createdAt: {
                        gte: sevenDaysAgo
                    }
                }
            })
        ]);

        return {
            total: posts + comments,
            posts,
            comments
        };
    }

    async createExperience(userId: string, data: CreateExperiencePayload): Promise<any> {
        return this.prisma.userExperience.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async updateExperience(userId: string, experienceId: string, data: UpdateExperiencePayload): Promise<any> {
        return this.prisma.userExperience.update({
            where: {
                id: experienceId,
                userId
            },
            data
        });
    }

    async deleteExperience(userId: string, experienceId: string): Promise<void> {
        await this.prisma.userExperience.delete({
            where: {
                id: experienceId,
                userId
            }
        });
    }

    async findExperienceById(experienceId: string): Promise<any | null> {
        return this.prisma.userExperience.findUnique({
            where: { id: experienceId }
        });
    }

    async createEducation(userId: string, data: CreateEducationPayload): Promise<any> {
        return this.prisma.userEducation.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async updateEducation(userId: string, educationId: string, data: UpdateEducationPayload): Promise<any> {
        return this.prisma.userEducation.update({
            where: {
                id: educationId,
                userId
            },
            data
        });
    }

    async deleteEducation(userId: string, educationId: string): Promise<void> {
        await this.prisma.userEducation.delete({
            where: {
                id: educationId,
                userId
            }
        });
    }

    async findEducationById(educationId: string): Promise<any | null> {
        return this.prisma.userEducation.findUnique({
            where: { id: educationId }
        });
    }

    async addUserSkill(userId: string, skillId: string): Promise<any> {
        return this.prisma.userSkill.create({
            data: {
                userId,
                skillId
            },
            include: {
                skill: true
            }
        });
    }

    async removeUserSkill(userId: string, skillId: string): Promise<void> {
        await this.prisma.userSkill.delete({
            where: {
                userId_skillId: {
                    userId,
                    skillId
                }
            }
        });
    }

    async findUserSkill(userId: string, skillId: string): Promise<any | null> {
        return this.prisma.userSkill.findUnique({
            where: {
                userId_skillId: {
                    userId,
                    skillId
                }
            }
        });
    }

    async createCertification(userId: string, data: CreateCertificationPayload): Promise<any> {
        return this.prisma.userCertification.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async updateCertification(userId: string, certificationId: string, data: UpdateCertificationPayload): Promise<any> {
        return this.prisma.userCertification.update({
            where: {
                id: certificationId,
                userId
            },
            data
        });
    }

    async deleteCertification(userId: string, certificationId: string): Promise<void> {
        await this.prisma.userCertification.delete({
            where: {
                id: certificationId,
                userId
            }
        });
    }

    async findCertificationById(certificationId: string): Promise<any | null> {
        return this.prisma.userCertification.findUnique({
            where: { id: certificationId }
        });
    }

    async createProject(userId: string, data: CreateProjectPayload): Promise<any> {
        return this.prisma.userProject.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async updateProject(userId: string, projectId: string, data: UpdateProjectPayload): Promise<any> {
        return this.prisma.userProject.update({
            where: {
                id: projectId,
                userId
            },
            data
        });
    }

    async deleteProject(userId: string, projectId: string): Promise<void> {
        await this.prisma.userProject.delete({
            where: {
                id: projectId,
                userId
            }
        });
    }

    async findProjectById(projectId: string): Promise<any | null> {
        return this.prisma.userProject.findUnique({
            where: { id: projectId }
        });
    }
}