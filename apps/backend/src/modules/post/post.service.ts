import { injectable, inject } from "inversify";
import { MediaType, CipherReason, PostType, PostStatus } from "../../generated/prisma/client";
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
}
