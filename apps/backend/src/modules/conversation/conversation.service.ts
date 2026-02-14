import { injectable, inject } from "inversify";
import { ConversationStatus, ConversationType, MessageType, MediaType, MessageStatus } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { ConversationRepository } from "./conversation.repository";
import { UserRepository } from "../user/user.repository";
import { StorageService } from "../storage/storage.service";
import { SocketService } from "../socket/socket.service";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { StartConversationInput, SendMessageInput } from "@devio/zod-utils";
import { plainToInstance } from "class-transformer";
import { ConversationDTO, MessageDTO } from "./conversation.dto";

@injectable()
export class ConversationService {
    constructor(
        @inject(TYPES.ConversationRepository) private conversationRepository: ConversationRepository,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.SocketService) private socketService: SocketService
    ) { }

    async startConversation(senderId: string, data: StartConversationInput) {
        if (senderId === data.recipientId) {
            throw new ApiError("You cannot start a conversation with yourself", StatusCodes.BAD_REQUEST);
        }

        const existing = await this.conversationRepository.findConversationBetweenUsers(senderId, data.recipientId);
        if (existing) {
            if (existing.status === ConversationStatus.INVITE_PENDING) {
                if (existing.inviteSenderId && existing.inviteSenderId !== senderId) {
                    const updated = await this.conversationRepository.updateConversationStatus(existing.id, ConversationStatus.ACCEPTED);
                    const senderDTO = this.populateDetails(plainToInstance(ConversationDTO, updated), existing.inviteSenderId);
                    this.socketService.io.to(`user:${existing.inviteSenderId}`).emit("invite:accepted", senderDTO);
                }
                else if (existing.inviteSenderId === senderId) {
                    throw new ApiError("A conversation invite is already pending", StatusCodes.CONFLICT);
                }
            }

            if (data.message) {
                await this.sendMessage(senderId, existing.id, { content: data.message });
            }

            return this.populateDetails(plainToInstance(ConversationDTO, existing), senderId);
        }

        const isFollowing = await this.userRepository.isFollowing(data.recipientId, senderId);
        const status = isFollowing ? ConversationStatus.ACCEPTED : ConversationStatus.INVITE_PENDING;

        const conversation = await this.conversationRepository.createConversation({
            type: ConversationType.DIRECT,
            status,
            inviteSenderId: status === ConversationStatus.INVITE_PENDING ? senderId : undefined,
            participants: [senderId, data.recipientId],
            initialMessage: {
                senderId,
                content: data.message,
                type: MessageType.TEXT
            }
        });

        const conversationDTO = plainToInstance(ConversationDTO, conversation);
        const recipientDTO = this.populateDetails(plainToInstance(ConversationDTO, conversation), data.recipientId);

        this.socketService.io.to(`user:${data.recipientId}`).emit("conversation:new", recipientDTO);

        return this.populateDetails(conversationDTO, senderId);
    }

    async sendMessage(senderId: string, conversationId: string, data: SendMessageInput, files: Express.Multer.File[] = []) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, senderId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        if (conversation.status === ConversationStatus.INVITE_PENDING) {
            if (files.length > 0) {
                throw new ApiError("Media attachments are not allowed during the invitation phase", StatusCodes.FORBIDDEN);
            }

            if (conversation.inviteSenderId === senderId) {
                throw new ApiError("You cannot send more messages until the invite is accepted", StatusCodes.FORBIDDEN);
            } else {
                await this.conversationRepository.updateConversationStatus(conversationId, ConversationStatus.ACCEPTED);
                conversation.status = ConversationStatus.ACCEPTED;

                if (conversation.inviteSenderId) {
                    const dto = this.populateDetails(plainToInstance(ConversationDTO, conversation), conversation.inviteSenderId);
                    this.socketService.io.to(`user:${conversation.inviteSenderId}`).emit("invite:accepted", dto);
                }
            }
        }

        if (conversation.status === ConversationStatus.DECLINED) {
            throw new ApiError("This conversation has been declined", StatusCodes.FORBIDDEN);
        }

        // Revive conversation if any participant has deleted it
        const hasDeletedParticipants = conversation.participants.some(p => p.hasDeleted);
        if (hasDeletedParticipants) {
            await this.conversationRepository.reviveConversation(conversationId);
        }

        const mediaData: { url: string; type: MediaType; fileName: string; fileSize: number }[] = [];
        const allowedMediaTypes: Record<string, MediaType> = {
            "image/jpeg": MediaType.IMAGE,
            "image/png": MediaType.IMAGE,
            "image/webp": MediaType.IMAGE,
            "video/mp4": MediaType.VIDEO,
            "video/webm": MediaType.VIDEO,
            "application/pdf": MediaType.FILE,
            "text/plain": MediaType.FILE
        };

        for (const file of files) {
            const path = `chat/${conversationId}/${Date.now()}-${file.originalname}`;
            const url = await this.storageService.uploadFile(file, path);
            const type = allowedMediaTypes[file.mimetype] || MediaType.FILE;

            mediaData.push({
                url,
                type,
                fileName: file.originalname,
                fileSize: file.size,
            });
        }

        const contentBasedType = data.content?.match(/https?:\/\/[^\s]+/) ? MessageType.LINK : MessageType.TEXT;
        let messageType: MessageType = contentBasedType;

        if (mediaData.length > 0) {
            const hasVideo = mediaData.some(m => m.type === MediaType.VIDEO);
            const hasFile = mediaData.some(m => m.type === MediaType.FILE);

            if (hasVideo) messageType = MessageType.VIDEO;
            else if (hasFile) messageType = MessageType.FILE;
            else messageType = MessageType.IMAGE;
        }

        const message = await this.conversationRepository.addMessage({
            conversationId,
            senderId,
            content: data.content,
            type: messageType,
            media: mediaData.length > 0 ? mediaData : undefined
        });

        const messageDTO = plainToInstance(MessageDTO, message);

        conversation.participants.forEach(p => {
            if (p.userId !== senderId) {
                this.socketService.io.to(`user:${p.userId}`).emit("message:new", messageDTO);
            }
        });

        return messageDTO;
    }

    async editMessage(userId: string, messageId: string, content: string) {
        const message = await this.conversationRepository.getMessageById(messageId);
        if (!message) throw new ApiError("Message not found", StatusCodes.NOT_FOUND);

        if (message.senderId !== userId) {
            throw new ApiError("You can only edit your own messages", StatusCodes.FORBIDDEN);
        }

        if (message.deletedAt) {
            throw new ApiError("Cannot edit a deleted message", StatusCodes.BAD_REQUEST);
        }

        const updatedMessage = await this.conversationRepository.editMessage(messageId, content);
        const messageDTO = plainToInstance(MessageDTO, updatedMessage);

        const conversation = await this.conversationRepository.getConversationById(message.conversationId, userId);
        if (conversation) {
            conversation.participants.forEach(p => {
                this.socketService.io.to(`user:${p.userId}`).emit("message:updated", messageDTO);
            });
        }

        return messageDTO;
    }

    async deleteMessage(userId: string, messageId: string, mode: 'me' | 'everyone') {
        const message = await this.conversationRepository.getMessageById(messageId);
        if (!message) throw new ApiError("Message not found", StatusCodes.NOT_FOUND);

        if (mode === 'everyone') {
            if (message.senderId !== userId) {
                throw new ApiError("You can only unsend your own messages", StatusCodes.FORBIDDEN);
            }
            const updated = await this.conversationRepository.softDeleteMessageForEveryone(messageId);
            const messageDTO = plainToInstance(MessageDTO, updated);

            const conversation = await this.conversationRepository.getConversationById(message.conversationId, userId);
            if (conversation) {
                conversation.participants.forEach(p => {
                    this.socketService.io.to(`user:${p.userId}`).emit("message:deleted", { messageId, type: 'everyone' });
                    this.socketService.io.to(`user:${p.userId}`).emit("message:updated", messageDTO);
                });
            }
        } else {
            await this.conversationRepository.hideMessageForUser(messageId, userId);
            this.socketService.io.to(`user:${userId}`).emit("message:deleted", { messageId, type: 'me' });
        }

        return { success: true };
    }

    async deleteConversation(userId: string, conversationId: string) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        await this.conversationRepository.clearConversationHistory(conversationId, userId);

        this.socketService.io.to(`user:${userId}`).emit("conversation:cleared", { conversationId });

        return { success: true };
    }

    async searchConversations(userId: string, query: string) {
        if (!query || query.length < 2) return [];

        const users = await this.userRepository.searchUsers(query, userId);
        const userIds = users.map(u => u.id).filter((id): id is string => !!id);

        if (userIds.length === 0) return [];

        const existingConversations = await this.conversationRepository.findConversationsWithUsers(userId, userIds);

        const results: ConversationDTO[] = [];
        const processedUserIds = new Set<string>();

        for (const conv of existingConversations) {
            if (conv.status === ConversationStatus.INVITE_PENDING && conv.inviteSenderId === userId) {
                continue;
            }

            const dto = plainToInstance(ConversationDTO, conv);
            const populated = this.populateDetails(dto, userId);
            results.push(populated);

            const otherParticipant = conv.participants.find(p => p.userId !== userId);
            if (otherParticipant) {
                processedUserIds.add(otherParticipant.userId);
            }
        }

        for (const user of users) {
            if (!processedUserIds.has(user.id!)) {
                const virtualConv = new ConversationDTO();
                virtualConv.id = "";
                virtualConv.type = ConversationType.DIRECT;
                virtualConv.name = user.username!;
                virtualConv.iconUrl = user.avatarUrl ?? null;
                virtualConv.participants = [{
                    userId: user.id,
                    user: {
                        id: user.id,
                        username: user.username!,
                        avatarUrl: user.avatarUrl ?? null
                    }
                }] as any;
                results.push(virtualConv);
            }
        }

        return results;
    }

    async acceptInvite(userId: string, conversationId: string) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        if (conversation.status !== ConversationStatus.INVITE_PENDING) {
            throw new ApiError("Invitation is not in a pending state", StatusCodes.BAD_REQUEST);
        }

        if (conversation.inviteSenderId === userId) {
            throw new ApiError("You cannot accept your own invitation", StatusCodes.BAD_REQUEST);
        }

        const updated = await this.conversationRepository.updateConversationStatus(conversationId, ConversationStatus.ACCEPTED);
        const dto = plainToInstance(ConversationDTO, updated);

        if (conversation.inviteSenderId) {
            const senderDTO = this.populateDetails(plainToInstance(ConversationDTO, updated), conversation.inviteSenderId);
            this.socketService.io.to(`user:${conversation.inviteSenderId}`).emit("invite:accepted", senderDTO);
        }

        return this.populateDetails(dto, userId);
    }

    async declineInvite(userId: string, conversationId: string) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        if (conversation.status !== ConversationStatus.INVITE_PENDING) {
            throw new ApiError("Invitation is not in a pending state", StatusCodes.BAD_REQUEST);
        }

        const updated = await this.conversationRepository.updateConversationStatus(conversationId, ConversationStatus.DECLINED);
        const dto = plainToInstance(ConversationDTO, updated);

        if (conversation.inviteSenderId) {
            const senderDTO = this.populateDetails(plainToInstance(ConversationDTO, updated), conversation.inviteSenderId);
            this.socketService.io.to(`user:${conversation.inviteSenderId}`).emit("invite:declined", senderDTO);
        }

        return this.populateDetails(dto, userId);
    }

    async getInteractions(userId: string, limit: number = 20, cursor?: string) {
        const conversations = await this.conversationRepository.findConversationsByUser(userId, limit, cursor);
        const dtos = plainToInstance(ConversationDTO, conversations);

        for (const dto of dtos) {
            const participant = conversations.find(c => c.id === dto.id)?.participants.find(p => p.userId === userId);
            if (participant) {
                dto.unreadCount = await this.conversationRepository.countUnreadMessagesInConversation(dto.id, userId, participant.lastReadAt);
            }
            this.populateDetails(dto, userId);
        }
        return dtos;
    }

    async getMessages(userId: string, conversationId: string, limit: number = 50, cursor?: string) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        const messages = await this.conversationRepository.findMessages(conversationId, userId, limit, cursor);
        return plainToInstance(MessageDTO, messages);
    }

    async markAsSeen(userId: string, conversationId: string) {
        const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
        if (!conversation) throw new ApiError("Conversation not found", StatusCodes.NOT_FOUND);

        const result = await this.conversationRepository.markAllMessagesAsSeen(conversationId, userId);

        conversation.participants.forEach(p => {
            if (p.userId !== userId) {
                this.socketService.io.to(`user:${p.userId}`).emit("conversation:seen", {
                    conversationId,
                    seenBy: userId
                });
            }
        });

        return result;
    }

    async getUnreadCount(userId: string) {
        const [messages, requests] = await Promise.all([
            this.conversationRepository.countUnreadMessages(userId),
            this.conversationRepository.countPendingInvites(userId)
        ]);

        return {
            messages,
            requests,
            total: messages + requests
        };
    }

    private populateDetails(dto: ConversationDTO, currentUserId: string): ConversationDTO {
        if (dto.type === ConversationType.DIRECT) {
            const other = dto.participants.find(p => p.userId !== currentUserId);
            if (other && other.user) {
                dto.name = other.user.username;
                dto.iconUrl = other.user.avatarUrl;
            }
        }
        return dto;
    }
}
