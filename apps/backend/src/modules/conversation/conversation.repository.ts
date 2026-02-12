import { injectable, inject } from "inversify";
import { PrismaClient, ConversationType, ConversationStatus, MessageType, MediaType, Prisma, MessageStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class ConversationRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async findConversationBetweenUsers(user1Id: string, user2Id: string) {
        return this.prisma.conversation.findFirst({
            where: {
                type: ConversationType.DIRECT,
                participants: {
                    every: {
                        userId: { in: [user1Id, user2Id] }
                    }
                }
            },
            include: {
                participants: true
            }
        });
    }

    async createConversation(data: {
        type: ConversationType;
        status: ConversationStatus;
        inviteSenderId?: string;
        participants: string[];
        initialMessage: {
            senderId: string;
            content?: string;
            type: MessageType;
            media?: { url: string; type: MediaType; fileName?: string; fileSize?: number }[];
        };
    }) {
        return this.prisma.$transaction(async (tx) => {
            const conversation = await tx.conversation.create({
                data: {
                    type: data.type,
                    status: data.status,
                    inviteSenderId: data.inviteSenderId,
                    participants: {
                        create: data.participants.map(userId => ({ userId }))
                    }
                }
            });

            await tx.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: data.initialMessage.senderId,
                    content: data.initialMessage.content,
                    type: data.initialMessage.type,
                    media: data.initialMessage.media ? {
                        create: data.initialMessage.media.map((m, index) => ({
                            url: m.url,
                            type: m.type,
                            fileName: m.fileName,
                            fileSize: m.fileSize,
                            position: index
                        }))
                    } : undefined
                }
            });

            return tx.conversation.findUnique({
                where: { id: conversation.id },
                include: {
                    participants: {
                        include: { user: { select: { id: true, username: true, avatarUrl: true } } }
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        include: { media: true }
                    }
                }
            });
        });
    }

    async addMessage(data: {
        conversationId: string;
        senderId: string;
        content?: string;
        type: MessageType;
        media?: { url: string; type: MediaType; fileName?: string; fileSize?: number }[];
    }) {
        return this.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                senderId: data.senderId,
                content: data.content,
                type: data.type,
                media: data.media ? {
                    create: data.media.map((m, index) => ({
                        url: m.url,
                        type: m.type,
                        fileName: m.fileName,
                        fileSize: m.fileSize,
                        position: index
                    }))
                } : undefined
            },
            include: {
                media: true,
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });
    }

    async updateConversationStatus(conversationId: string, status: ConversationStatus) {
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { status }
        });
    }

    async editMessage(messageId: string, content: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                editedAt: new Date()
            },
            include: {
                media: true,
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });
    }

    async softDeleteMessageForEveryone(messageId: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                deletedAt: new Date(),
                content: "This message was unsent",
                media: { deleteMany: {} } // Remove media attachment links
            },
            include: {
                media: true,
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });
    }

    async hideMessageForUser(messageId: string, userId: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                deletedByParticipantIds: { push: userId }
            }
        });
    }

    async clearConversationHistory(conversationId: string, userId: string) {
        return this.prisma.conversationParticipant.update({
            where: {
                conversationId_userId: { conversationId, userId }
            },
            data: {
                hasDeleted: true,
                messagesClearedAt: new Date()
            }
        });
    }

    async reviveConversation(conversationId: string) {
        // Un-hide conversation for all participants when new activity occurs
        return this.prisma.conversationParticipant.updateMany({
            where: { conversationId },
            data: { hasDeleted: false }
        });
    }

    async findConversationsByUser(userId: string, limit: number = 20, cursor?: string) {
        return this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                        hasDeleted: false
                    }
                }
            },
            take: limit,
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } }
                },
                messages: {
                    take: 1,
                    where: {
                        NOT: {
                            deletedByParticipantIds: { has: userId }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        media: true,
                        sender: { select: { id: true, username: true, avatarUrl: true } }
                    }
                }
            }
        });
    }

    async searchConversations(userId: string, query: string) {
        return this.prisma.conversation.findMany({
            where: {
                type: ConversationType.DIRECT,
                participants: {
                    some: { userId } // I am a participant
                },
                AND: {
                    participants: {
                        some: {
                            userId: { not: userId },
                            user: {
                                username: { contains: query, mode: 'insensitive' }
                            }
                        }
                    }
                }
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            take: 10
        });
    }

    async findMessages(conversationId: string, userId: string, limit: number = 50, cursor?: string) {
        // Get the participant info to check `messagesClearedAt`
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } }
        });

        const clearedAt = participant?.messagesClearedAt || new Date(0); // Default to epoch if null

        return this.prisma.message.findMany({
            where: {
                conversationId,
                createdAt: { gt: clearedAt },
                NOT: {
                    deletedByParticipantIds: { has: userId }
                }
            },
            take: -limit, // Get latest messages
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            orderBy: { createdAt: 'asc' },
            include: {
                media: true,
                sender: { select: { id: true, username: true, avatarUrl: true } }
            }
        });
    }

    async getMessageById(messageId: string) {
        return this.prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true }
        });
    }

    async getConversationById(conversationId: string, userId: string) {
        return this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId } }
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } }
                },
                _count: {
                    select: { messages: true }
                }
            }
        });
    }

    async updateMessageStatus(messageIds: string[], status: MessageStatus) {
        return this.prisma.message.updateMany({
            where: { id: { in: messageIds } },
            data: { status }
        });
    }

    async markAllMessagesAsSeen(conversationId: string, userId: string) {
        return this.prisma.$transaction([
            // 1. Mark messages as SEEN
            this.prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    status: { not: MessageStatus.SEEN }
                },
                data: { status: MessageStatus.SEEN }
            }),
            // 2. Update Participant's lastReadAt
            this.prisma.conversationParticipant.update({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId
                    }
                },
                data: { lastReadAt: new Date() }
            })
        ]);
    }
}
