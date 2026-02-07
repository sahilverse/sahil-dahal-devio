import { injectable, inject } from "inversify";
import { TopicRepository } from "./topic.repository";
import type { PrismaClient, Topic, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import slugify from "slugify";
import { plainToInstance } from "class-transformer";
import { TopicDTO } from "./topic.dto";

@injectable()
export class TopicService {
    constructor(
        @inject(TYPES.TopicRepository) private topicRepository: TopicRepository
    ) { }

    async createTopic(name: string, tx?: Prisma.TransactionClient): Promise<Topic> {
        const slug = slugify(name, { lower: true, strict: true });

        const existingTopic = await this.topicRepository.findBySlug(slug, tx);
        if (existingTopic) {
            return existingTopic;
        }

        return this.topicRepository.create(name, slug, tx);
    }

    async searchTopics(query: string): Promise<TopicDTO[]> {
        const topics = await this.topicRepository.search(query);

        return plainToInstance(TopicDTO, topics.map((topic: any) => ({
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            count: Number(topic.count)
        })));
    }

    async findTopicBySlug(slug: string): Promise<Topic | null> {
        return this.topicRepository.findBySlug(slug);
    }
}
