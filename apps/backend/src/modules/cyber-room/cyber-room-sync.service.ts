import { injectable, inject } from "inversify";
import { CyberRoomRepository } from "./cyber-room.repository";
import { StorageService } from "../storage/storage.service";
import { TYPES } from "../../types";
import { logger, normalizeContent } from "../../utils";
import slugify from "slugify";
import { Difficulty, CTFChallengeType } from "../../generated/prisma/client";

@injectable()
export class CyberRoomSyncService {
    constructor(
        @inject(TYPES.CyberRoomRepository) private roomRepository: CyberRoomRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
    ) { }

    async handleMinioEvent(bucket: string, key: string): Promise<void> {
        if (!key.endsWith("room-structure.json")) return;

        logger.info(`Processing room ingestion: ${key} in bucket ${bucket}`);

        try {
            const content = await this.storageService.getFile(key, bucket);
            const structureData = JSON.parse(content);
            const slug = slugify(structureData.title, { lower: true, strict: true });
            const roomFolder = key.includes('/') ? key.substring(0, key.lastIndexOf('/')) : '';

            let richDescription: string;
            try {
                const rawDescription = await this.storageService.getFile(`${roomFolder}/description.md`, bucket);
                richDescription = normalizeContent(rawDescription);
            } catch {
                richDescription = normalizeContent(structureData.description || "No description provided.");
            }

            const challengesData = structureData.challenges?.map((c: any, index: number) => ({
                title: c.title,
                description: c.description,
                type: c.type as CTFChallengeType,
                flag: c.flag,
                points: c.points || 10,
                hints: c.hints || [],
                order: c.order ?? index
            })) || [];

            const isPublished = !!structureData.publish;

            await this.roomRepository.syncRoomWithRelations({
                slug,
                title: structureData.title,
                difficulty: structureData.difficulty as Difficulty,
                description: richDescription,
                imageId: structureData.imageId,
                estimatedTime: structureData.estimatedTime || null,
                pointsReward: structureData.pointsReward || 0,
                isPublished,
                challenges: challengesData
            });

            logger.info(`Successfully synced room: ${structureData.title} (${slug})`);
        } catch (error: any) {
            logger.error(`Failed to process MinIO event for ${key}: ${error.message}`);
        }
    }
}
