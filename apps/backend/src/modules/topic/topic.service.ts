import { injectable, inject } from "inversify";
import { TopicRepository } from "./topic.repository";
import type { Topic } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import slugify from "slugify";

@injectable()
export class TopicService {
    constructor(
        @inject(TYPES.TopicRepository) private topicRepository: TopicRepository
    ) { }

    async createTopic(name: string): Promise<Topic> {
        const slug = slugify(name, { lower: true, strict: true });

        const existingTopic = await this.topicRepository.findBySlug(slug);
        if (existingTopic) {
            return existingTopic;
        }

        return this.topicRepository.create(name, slug);
    }

    async searchTopics(query: string): Promise<Topic[]> {
        return this.topicRepository.search(query);
    }

    async findTopicBySlug(slug: string): Promise<Topic | null> {
        return this.topicRepository.findBySlug(slug);
    }
}
