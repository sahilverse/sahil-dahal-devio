import { injectable, inject } from "inversify";
import { NotificationType } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import { NotificationService } from "../notification/notification.service";
import { UserRepository } from "../user/user.repository";
import { logger } from "../../utils/logger";

@injectable()
export class MentionService {
    constructor(
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
    ) { }

    private MENTION_REGEX = {
        USER: /(?:^|\s)u\/([a-zA-Z0-9_-]+)/g,
        COMMUNITY: /(?:^|\s)d\/([a-zA-Z0-9_-]+)/g,
    };

    /**
     * Parses the content and returns extracted mentions.
     */
    parseMentions(content: string) {
        const users = [...content.matchAll(this.MENTION_REGEX.USER)].map(m => m[1]);
        const communities = [...content.matchAll(this.MENTION_REGEX.COMMUNITY)].map(m => m[1]);

        return {
            users: [...new Set(users)],
            communities: [...new Set(communities)],
        };
    }

    async processMentions(params: {
        content: string;
        authorId: string;
        sourceType: "POST" | "COMMENT";
        sourceId: string;
        actionUrl: string;
    }) {
        const { users, communities } = this.parseMentions(params.content);

        // 1. Process User Mentions -> Notifications
        for (const username of users) {
            try {
                const user = await this.userRepository.findByUsername(username!);
                if (user && user.id !== params.authorId) {
                    await this.notificationService.notify({
                        userId: user.id,
                        type: NotificationType.MENTION,
                        actorId: params.authorId,
                        message: `mentioned you in a ${params.sourceType.toLowerCase()}`,
                        actionUrl: params.actionUrl,
                        data: {
                            sourceType: params.sourceType,
                            sourceId: params.sourceId,
                        }
                    });
                }
            } catch (error) {
                logger.error(error as Error, `Error processing user mention for ${username}`);
            }
        }

        return { users, communities };
    }
}
