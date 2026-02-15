import { injectable, inject } from "inversify";
import { ActivityType, AuraReason, CipherReason, MediaType, PostType, NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { CommentRepository } from "./comment.repository";
import { CommentResponseDto, GetCommentsDto } from "./comment.dto";
import { PostRepository } from "../post/post.repository";
import { StorageService } from "../storage/storage.service";
import { AuraService } from "../aura/aura.service";
import { ActivityService } from "../activity/activity.service";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { CommunityRepository } from "../community/community.repository";
import { MentionService } from "../mention/mention.service";
import { logger } from "../../utils/logger";
import { NotificationService } from "../notification/notification.service";

@injectable()
export class CommentService {
    constructor(
        @inject(TYPES.CommentRepository) private commentRepository: CommentRepository,
        @inject(TYPES.PostRepository) private postRepository: PostRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.AuraService) private auraService: AuraService,
        @inject(TYPES.ActivityService) private activityService: ActivityService,
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
        @inject(TYPES.MentionService) private mentionService: MentionService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
    ) { }

    async createComment(
        userId: string,
        postId: string,
        data: { content: string; parentId?: string },
        files: Express.Multer.File[] = [],
        timezoneOffset?: number
    ): Promise<CommentResponseDto> {
        // 1. Validate post exists
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        // Aura Check for Community
        if (post.communityId) {
            const settings = await this.communityRepository.findSettings(post.communityId);
            if (settings && settings.minAuraToComment > 0) {
                const userAura = await this.auraService.getPoints(userId);
                if (userAura < settings.minAuraToComment) {
                    throw new ApiError(`You need at least ${settings.minAuraToComment} Aura points to comment in this community`, StatusCodes.FORBIDDEN);
                }
            }
        }

        // 2. If reply, validate parent comment exists and belongs to same post
        let parentComment: any = null;
        if (data.parentId) {
            parentComment = await this.commentRepository.findById(data.parentId);
            if (!parentComment) throw new ApiError("Parent comment not found", StatusCodes.NOT_FOUND);
            if (parentComment.postId !== postId) throw new ApiError("Parent comment does not belong to this post", StatusCodes.BAD_REQUEST);

            // Flatten nested replies: if parent has a parent, reply to the parent's parent instead
            if (parentComment.parentId) {
                data.parentId = parentComment.parentId;
            }
        }

        // 3. Upload media
        const mediaData: { url: string; type: MediaType; fileName: string; fileSize: number }[] = [];
        const allowedMediaTypes: Record<string, MediaType> = {
            "image/jpeg": MediaType.IMAGE,
            "image/png": MediaType.IMAGE,
            "image/webp": MediaType.IMAGE,
        };

        for (const file of files) {
            const path = `comments/${userId}/${Date.now()}-${file.originalname}`;
            const url = await this.storageService.uploadFile(file, path);
            const type = allowedMediaTypes[file.mimetype] || MediaType.FILE;

            mediaData.push({
                url,
                type,
                fileName: file.originalname,
                fileSize: file.size,
            });
        }

        // 4. Create comment
        const comment = await this.commentRepository.create(
            {
                postId,
                authorId: userId,
                content: data.content,
                parentId: data.parentId,
            },
            mediaData
        );

        // 5. Log activity (for heatmap & streaks)
        await this.activityService.logActivity(userId, ActivityType.COMMENT_CREATE, timezoneOffset);

        // 6. Process Mentions (Non-blocking)
        const mentionResultsPromise = this.mentionService.processMentions({
            content: comment.content,
            authorId: userId,
            sourceType: "COMMENT",
            sourceId: comment.id,
            actionUrl: `/post/${comment.postId}#comment-${comment.id}`,
        });

        // 7. Handle Post & Parent Author Notifications (Non-blocking)
        (async () => {
            try {
                const { notifiedUserIds } = await mentionResultsPromise;
                const notifiedSet = new Set(notifiedUserIds);

                const commentUrl = `/post/${comment.postId}#comment-${comment.id}`;

                // A. Notify Post Author
                if (post.authorId !== userId && !notifiedSet.has(post.authorId)) {
                    await this.notificationService.notify({
                        userId: post.authorId,
                        type: NotificationType.COMMENT,
                        actorId: userId,
                        message: `commented on your post: "${post.title}"`,
                        actionUrl: commentUrl,
                        data: { postId: post.id, commentId: comment.id }
                    });
                    notifiedSet.add(post.authorId);
                }

                // B. Notify Parent Comment Author (if reply)
                if (parentComment && parentComment.authorId !== userId && !notifiedSet.has(parentComment.authorId)) {
                    await this.notificationService.notify({
                        userId: parentComment.authorId,
                        type: NotificationType.COMMENT,
                        actorId: userId,
                        message: `replied to your comment`,
                        actionUrl: commentUrl,
                        data: { postId: post.id, commentId: comment.id, parentId: parentComment.id }
                    });
                    notifiedSet.add(parentComment.authorId);
                }

                // C. Notify users mentioned in parent comment (if reply)
                if (parentComment) {
                    const { users: parentMentionedUsernames } = this.mentionService.parseMentions(parentComment.content);
                    for (const username of parentMentionedUsernames) {
                        try {
                            const user = await this.postRepository.client.user.findUnique({ where: { username }, select: { id: true } });
                            if (user && user.id !== userId && !notifiedSet.has(user.id)) {
                                await this.notificationService.notify({
                                    userId: user.id,
                                    type: NotificationType.COMMENT,
                                    actorId: userId,
                                    message: `replied to a comment you were mentioned in`,
                                    actionUrl: commentUrl,
                                    data: { postId: post.id, commentId: comment.id, parentId: parentComment.id }
                                });
                                notifiedSet.add(user.id);
                            }
                        } catch (e) {
                            // Ignore user lookup errors
                        }
                    }
                }
            } catch (err) {
                logger.error(`Notification processing failed for comment ${comment.id}: ${err}`);
            }
        })();

        return plainToInstance(CommentResponseDto, comment, {
            excludeExtraneousValues: true,
            currentUserId: userId,
        } as any);
    }

    async getComments(
        postId: string,
        query: GetCommentsDto,
        currentUserId?: string
    ): Promise<{ comments: CommentResponseDto[]; nextCursor: string | null }> {
        const comments = await this.commentRepository.findByPostId(postId, {
            cursor: query.cursor,
            limit: query.limit,
            sort: query.sort,
            currentUserId,
        });

        let nextCursor: string | null = null;
        if (comments.length > query.limit) {
            const nextItem = comments.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            comments: plainToInstance(CommentResponseDto, comments as any[], {
                excludeExtraneousValues: true,
                currentUserId,
            } as any),
            nextCursor,
        };
    }

    async getReplies(
        commentId: string,
        query: { cursor?: string; limit: number },
        currentUserId?: string
    ): Promise<{ replies: CommentResponseDto[]; nextCursor: string | null }> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);

        const replies = await this.commentRepository.findReplies(commentId, {
            cursor: query.cursor,
            limit: query.limit,
            currentUserId,
        });

        let nextCursor: string | null = null;
        if (replies.length > query.limit) {
            const nextItem = replies.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            replies: plainToInstance(CommentResponseDto, replies as any[], {
                excludeExtraneousValues: true,
                currentUserId,
            } as any),
            nextCursor,
        };
    }

    async updateComment(
        userId: string,
        commentId: string,
        data: { content: string }
    ): Promise<CommentResponseDto> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);
        if (comment.deletedAt) throw new ApiError("Cannot edit a deleted comment", StatusCodes.BAD_REQUEST);
        if (comment.authorId !== userId) {
            throw new ApiError("You are not authorized to edit this comment", StatusCodes.FORBIDDEN);
        }

        const updated = await this.commentRepository.update(commentId, data.content, userId);

        return plainToInstance(CommentResponseDto, updated, {
            excludeExtraneousValues: true,
            currentUserId: userId,
        } as any);
    }

    async deleteComment(
        userId: string,
        commentId: string
    ): Promise<void> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);
        if (comment.deletedAt) throw new ApiError("Comment already deleted", StatusCodes.BAD_REQUEST);

        // Check authorization: comment author, post author, or community mod
        const post = await this.postRepository.findById(comment.postId);
        const isCommentAuthor = comment.authorId === userId;
        const isPostAuthor = post?.authorId === userId;

        let isCommunityMod = false;
        if (post && (post as any).communityId) {
            isCommunityMod = await this.communityRepository.isModeratorOrCreator((post as any).communityId, userId);
        }

        if (!isCommentAuthor && !isPostAuthor && !isCommunityMod) {
            throw new ApiError("You are not authorized to delete this comment", StatusCodes.FORBIDDEN);
        }

        await this.commentRepository.softDelete(commentId);
    }

    async voteComment(
        userId: string,
        commentId: string,
        type: "UP" | "DOWN" | null
    ): Promise<CommentResponseDto> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);

        // Anti-Abuse: Self-voting applies NO Aura points.
        const isSelfVote = comment.authorId === userId;

        // 1. Get Existing Vote
        const existingVote = await this.commentRepository.getVote(commentId, userId);
        const existingType = existingVote?.type || null;

        // 2. Calculate Aura Delta for the AUTHOR
        let auraDelta = 0;
        const UP_POINTS = 3;
        const DOWN_POINTS = -1;

        if (existingType === type) {
            // Toggling off
            if (type === "UP") auraDelta = -UP_POINTS;
            if (type === "DOWN") auraDelta = -DOWN_POINTS;
        } else if (existingType === null) {
            // New Vote
            if (type === "UP") auraDelta = UP_POINTS;
            if (type === "DOWN") auraDelta = DOWN_POINTS;
        } else {
            // Changing Vote
            if (existingType === "UP") auraDelta -= UP_POINTS;
            if (existingType === "DOWN") auraDelta -= DOWN_POINTS;
            if (type === "UP") auraDelta += UP_POINTS;
            if (type === "DOWN") auraDelta += DOWN_POINTS;
        }

        // 3. Execute Vote
        const updatedComment = await this.commentRepository.vote(commentId, userId, type);

        // 4. Award Aura to AUTHOR
        if (auraDelta !== 0 && !isSelfVote) {
            const reason = auraDelta > 0 ? AuraReason.COMMENT_UPVOTED : AuraReason.COMMENT_DOWNVOTED;
            await this.auraService.awardAura(comment.authorId, auraDelta, reason, commentId);
        }

        return plainToInstance(CommentResponseDto, updatedComment, {
            excludeExtraneousValues: true,
            currentUserId: userId,
        } as any);
    }

    async acceptAnswer(
        userId: string,
        postId: string,
        commentId: string
    ): Promise<void> {
        // 1. Validate post exists and is QUESTION type
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);
        if ((post as any).type !== PostType.QUESTION) {
            throw new ApiError("Only QUESTION posts can have accepted answers", StatusCodes.BAD_REQUEST);
        }
        if ((post as any).authorId !== userId) {
            throw new ApiError("Only the post author can accept an answer", StatusCodes.FORBIDDEN);
        }

        // 2. Validate comment exists, belongs to post, is top-level
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) throw new ApiError("Comment not found", StatusCodes.NOT_FOUND);
        if (comment.postId !== postId) throw new ApiError("Comment does not belong to this post", StatusCodes.BAD_REQUEST);
        if (comment.parentId) throw new ApiError("Only top-level comments can be accepted as answers", StatusCodes.BAD_REQUEST);

        // 3. Transaction: update accepted answer + transfer bounty
        let bountyAwarded = false;
        const bountyAmount = (post as any).bountyAmount;

        await this.commentRepository.client.$transaction(async (tx) => {
            // Set accepted answer
            await tx.post.update({
                where: { id: postId },
                data: { acceptedAnswerId: commentId },
            });

            // Transfer bounty if exists and not yet paid
            const isBountyPaid = (post as any).isBountyPaid;
            const isSelfAnswer = comment.authorId === userId;

            if (bountyAmount && bountyAmount > 0 && !isBountyPaid && !isSelfAnswer) {
                // Transfer Cipher to comment author
                await tx.user.update({
                    where: { id: comment.authorId },
                    data: { cipherBalance: { increment: bountyAmount } },
                });

                // Record transaction
                await tx.cipherTransaction.create({
                    data: {
                        userId: comment.authorId,
                        amount: bountyAmount,
                        reason: CipherReason.ANSWER_ACCEPTED,
                        sourceId: postId,
                    },
                });

                // Mark bounty as paid
                await tx.post.update({
                    where: { id: postId },
                    data: { isBountyPaid: true },
                });

                bountyAwarded = true;
            }
        });

        // 4. Award Aura to comment author (outside transaction)
        if (comment.authorId !== userId) {
            await this.auraService.awardAura(comment.authorId, 15, AuraReason.ANSWER_ACCEPTED, postId);
        }

        // 5. Real-time Notifications
        if (comment.authorId !== userId) {
            const postUrl = `/post/${postId}#comment-${commentId}`;

            // Notify: answer accepted
            this.notificationService.notify({
                userId: comment.authorId,
                type: NotificationType.COMMENT,
                actorId: userId,
                message: `accepted your answer on "${(post as any).title}"`,
                actionUrl: postUrl,
                data: { postId, commentId, event: "answer_accepted" },
            }).catch(err => logger.error(`Notification failed for answer accept: ${err}`));

            // Notify: bounty awarded
            if (bountyAwarded && bountyAmount) {
                this.notificationService.notify({
                    userId: comment.authorId,
                    type: NotificationType.SYSTEM,
                    actorId: userId,
                    message: `You received ${bountyAmount} Ciphers bounty for your answer!`,
                    actionUrl: postUrl,
                    data: { postId, commentId, bountyAmount, event: "bounty_awarded" },
                }).catch(err => logger.error(`Notification failed for bounty award: ${err}`));
            }
        }
    }

    async unacceptAnswer(
        userId: string,
        postId: string
    ): Promise<void> {
        // 1. Validate post exists and is QUESTION type
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);
        if ((post as any).type !== PostType.QUESTION) {
            throw new ApiError("Only QUESTION posts can have accepted answers", StatusCodes.BAD_REQUEST);
        }
        if ((post as any).authorId !== userId) {
            throw new ApiError("Only the post author can unaccept an answer", StatusCodes.FORBIDDEN);
        }
        if (!(post as any).acceptedAnswerId) {
            throw new ApiError("No answer is currently accepted", StatusCodes.BAD_REQUEST);
        }

        // 2. Clear accepted answer (no bounty refund, no aura clawback)
        await this.commentRepository.client.post.update({
            where: { id: postId },
            data: { acceptedAnswerId: null },
        });
    }
}
