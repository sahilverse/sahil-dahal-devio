import { injectable, inject } from "inversify";
import type { User, PrismaClient, AccountStatusHistory } from "../../generated/prisma/client";
import type {
    CreateUserPayload,
    AccountStatusPayload,
    CreateOAuthUserPayload,
    CreateAccountPayload
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

    async deleteProfilePicture(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                avatarUrl: null
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
                experiences: { orderBy: { startDate: 'desc' } },
                educations: { orderBy: { startDate: 'desc' } },
                certifications: { orderBy: { issueDate: 'desc' } },
                projects: { orderBy: { startDate: 'desc' } },
                skills: true,
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
}