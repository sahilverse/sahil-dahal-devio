import { injectable, inject } from "inversify";
import { MediaType, CipherReason, PostType, PostStatus, PostVisibility } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { CreatePostInput } from "@devio/zod-utils";
import { StorageService } from "../storage/storage.service";
import { TopicService } from "../topic/topic.service";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { PostRepository } from "./post.repository";
import { plainToInstance } from "class-transformer";
import { PostResponseDto, GetPostsDto } from "./post.dto";


@injectable()
export class PostService {
    constructor(
        @inject(TYPES.PostRepository) private postRepository: PostRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.TopicService) private topicService: TopicService
    ) { }

    async createPost(
        userId: string,
        data: CreatePostInput,
        files: Express.Multer.File[]
    ): Promise<PostResponseDto> {
        // 1. Bounty Check
        if (data.type === "QUESTION" && data.bountyAmount && data.bountyAmount > 0) {
            const user = await this.postRepository.client.user.findUnique({
                where: { id: userId },
                select: { cipherBalance: true },
            });

            if (!user || user.cipherBalance < data.bountyAmount) {
                throw new ApiError("Insufficient Cipher balance for bounty", StatusCodes.BAD_REQUEST);
            }
        }

        // 2. Resolve Topics
        const topicIds: string[] = [];
        if (data.topics && data.topics.length > 0) {
            for (const topicName of data.topics) {
                const topic = await this.topicService.createTopic(topicName);
                if (topic) {
                    topicIds.push(topic.id);
                }
            }
        }

        // 3. Upload Media
        const mediaData: { url: string; type: MediaType; fileName: string; fileSize: number }[] = [];
        const allowedMediaTypes = {
            "image/jpeg": MediaType.IMAGE,
            "image/png": MediaType.IMAGE,
            "image/webp": MediaType.IMAGE,
        };

        for (const file of files) {
            const path = `posts/${userId}/${Date.now()}-${file.originalname}`;
            const url = await this.storageService.uploadFile(file, path);
            const type = allowedMediaTypes[file.mimetype as keyof typeof allowedMediaTypes] || MediaType.FILE;

            mediaData.push({
                url,
                type,
                fileName: file.originalname,
                fileSize: file.size,
            });
        }

        // 4. Transaction
        return await this.postRepository.client.$transaction(async (tx) => {
            // Deduct Bounty
            if (data.type === "QUESTION" && data.bountyAmount && data.bountyAmount > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { cipherBalance: { decrement: data.bountyAmount } },
                });

                await tx.cipherTransaction.create({
                    data: {
                        userId,
                        amount: -data.bountyAmount,
                        reason: CipherReason.BOUNTY_CREATED,
                    },
                });
            }


            // Create Post
            const post = await tx.post.create({
                data: {
                    authorId: userId,
                    title: data.title,
                    content: data.content,
                    type: data.type as PostType,
                    status: data.status as PostStatus,
                    communityId: data.communityId,
                    linkUrl: data.type === "LINK" ? data.linkUrl : undefined,
                    bountyAmount: data.type === "QUESTION" ? data.bountyAmount : undefined,
                    // Connect Topics
                    topics: {
                        create: topicIds.map((id) => ({
                            topic: { connect: { id } },
                        })),
                    },
                    // Create Media
                    media: {
                        create: mediaData.map((m, index) => ({
                            url: m.url,
                            type: m.type,
                            fileName: m.fileName,
                            fileSize: m.fileSize,
                            position: index,
                        })),
                    },
                    // Create Poll Options
                    pollOptions:
                        data.type === "POLL" && data.pollOptions
                            ? {
                                create: data.pollOptions.map((text: string, index: number) => ({
                                    text,
                                    order: index,
                                })),
                            }
                            : undefined,
                },
                include: {
                    media: true,
                    topics: { include: { topic: true } },
                    pollOptions: true,
                    community: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                },

            });

            return plainToInstance(PostResponseDto, post, { excludeExtraneousValues: true });
        });
    }

    async getPosts(
        query: GetPostsDto,
        currentUserId?: string
    ): Promise<{ posts: PostResponseDto[]; nextCursor: string | null }> {
        const posts = await this.postRepository.findMany({
            cursor: query.cursor,
            limit: query.limit,
            userId: query.userId,
            communityId: query.communityId,
            currentUserId,
            status: query.status,
            visibility: query.visibility,
        });

        let nextCursor: string | null = null;
        if (posts.length > query.limit) {
            const nextItem = posts.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            posts: plainToInstance(PostResponseDto, posts, { excludeExtraneousValues: true }),
            nextCursor,
        };
    }

    async updatePost(userId: string, postId: string, data: any): Promise<PostResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        if (post.authorId !== userId) {
            throw new ApiError("You are not authorized to update this post", StatusCodes.FORBIDDEN);
        }

        const updatedPost = await this.postRepository.update(postId, data);
        return plainToInstance(PostResponseDto, updatedPost, { excludeExtraneousValues: true });
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        if (post.authorId !== userId) {
            throw new ApiError("You are not authorized to delete this post", StatusCodes.FORBIDDEN);
        }
        const deletedPost = await this.postRepository.delete(postId);

        // Cleanup Media from Storage
        if (deletedPost && deletedPost.media && deletedPost.media.length > 0) {
            for (const media of deletedPost.media) {
                await this.storageService.deleteFile(media.url);
            }
        }
    }

    async getPostCount(userId: string, status?: PostStatus, visibility?: PostVisibility): Promise<{ count: number }> {
        const count = await this.postRepository.count({ userId, status, visibility });
        return { count };
    }

    async votePost(userId: string, postId: string, type: "UP" | "DOWN" | null): Promise<PostResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        const updatedPost = await this.postRepository.vote(postId, userId, type);
        return plainToInstance(PostResponseDto, updatedPost, { excludeExtraneousValues: true });
    }

    async toggleSavePost(userId: string, postId: string): Promise<{ isSaved: boolean }> {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        const isSaved = await this.postRepository.toggleSave(postId, userId);
        return { isSaved };
    }

    async togglePinPost(userId: string, postId: string, isPinned: boolean): Promise<PostResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) throw new ApiError("Post not found", StatusCodes.NOT_FOUND);

        if (post.authorId !== userId) {
            throw new ApiError("You are not authorized to pin this post", StatusCodes.FORBIDDEN);
        }

        const updatedPost = await this.postRepository.togglePin(postId, isPinned);
        return plainToInstance(PostResponseDto, updatedPost, { excludeExtraneousValues: true });
    }
}
