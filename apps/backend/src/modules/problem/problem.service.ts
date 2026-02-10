import { injectable, inject } from "inversify";
import { ProblemRepository } from "./problem.repository";
import { StorageService } from "../storage/storage.service";
import { TYPES } from "../../types";
import { logger, ApiError, normalizeContent } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { LANGUAGE_EXTENSIONS } from "@devio/boilerplate-generator";
import { plainToInstance } from "class-transformer";
import { ProblemResponseDTO } from "./problem.dto";
import { RedisManager } from "../../config/redis";
import { ProblemDraftService } from "./draft";
import { ProblemSyncService } from "./problem-sync.service";
import { MINIO_BUCKET_PROBLEMS, PROBLEM_REDIS_TTL, PROBLEM_REDIS_KEYS } from "../../config/constants";


@injectable()
export class ProblemService {
    constructor(
        @inject(TYPES.ProblemRepository) private problemRepository: ProblemRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.ProblemDraftService) private draftService: ProblemDraftService,
        @inject(TYPES.ProblemSyncService) private syncService: ProblemSyncService
    ) { }

    private parseStoragePath(storagePath: string): { bucket: string; folder: string } {
        const bucket = storagePath.split('/')[0] || MINIO_BUCKET_PROBLEMS;
        const folder = storagePath.replace(`${bucket}/`, "");
        return { bucket, folder };
    }

    async getProblemBySlug(slug: string): Promise<ProblemResponseDTO> {
        const problem = await this.problemRepository.findBySlug(slug);
        if (!problem) throw new ApiError("Problem not found", StatusCodes.NOT_FOUND);

        const dto = plainToInstance(ProblemResponseDTO, problem, { excludeExtraneousValues: true });

        try {
            const cached = await this.redisManager.getPub().get(PROBLEM_REDIS_KEYS.SAMPLES(slug));

            if (cached) {
                dto.testCases = JSON.parse(cached).map((s: any) => ({
                    id: s.id, input: s.input, output: s.output
                }));
            } else {
                logger.warn(`Cache miss for samples: ${slug}. Triggering refresh...`);
                const { bucket } = this.parseStoragePath(problem.storagePath || MINIO_BUCKET_PROBLEMS);
                const publicCases = await this.problemRepository.getSampleTestCases(problem.id);

                if (publicCases.length > 0) {
                    // Logic for caching samples remains here as it's retrieval-bound
                    this.cacheSamples(slug, publicCases, bucket).catch(err =>
                        logger.error(`Self-healing cache refresh failed for ${slug}: ${err.message}`)
                    );
                }
                dto.testCases = [];
            }
        } catch (err) {
            logger.error(`Error fetching samples from Redis: ${err}`);
            dto.testCases = [];
        }

        return dto;
    }

    private async cacheSamples(slug: string, testCases: any[], bucket: string): Promise<void> {
        const sampleCases = [];
        for (const tc of testCases) {
            try {
                const inputRaw = await this.storageService.getFile(tc.inputPath, bucket);
                const outputRaw = await this.storageService.getFile(tc.outputPath, bucket);

                // Normalizing content
                const input = normalizeContent(inputRaw);
                const output = normalizeContent(outputRaw);

                sampleCases.push({ id: tc.id, input, output });
            } catch (err: any) {
                logger.error(`Failed to fetch test case (ID: ${tc.id}): ${err.message}`);
            }
        }

        if (sampleCases.length > 0) {
            await this.redisManager.getPub().set(PROBLEM_REDIS_KEYS.SAMPLES(slug), JSON.stringify(sampleCases), "EX", PROBLEM_REDIS_TTL);
            logger.info(`Cached ${sampleCases.length} samples for: ${slug}`);
        }
    }

    async getBoilerplate(slug: string, language: string, userId?: string): Promise<string | null> {
        if (userId) {
            const problem = await this.problemRepository.findBySlug(slug);
            if (problem) {
                const draft = await this.draftService.getDraft(userId, problem.id, language);
                if (draft) return draft.code;
            }
        }

        return this.getCachedBoilerplate(slug, language, "boilerplate");
    }

    async getFullBoilerplate(slug: string, language: string): Promise<string | null> {
        return this.getCachedBoilerplate(slug, language, "boilerplate-full");
    }

    private async getCachedBoilerplate(
        slug: string,
        language: string,
        tier: "boilerplate" | "boilerplate-full"
    ): Promise<string | null> {
        const redisKey = tier === "boilerplate"
            ? PROBLEM_REDIS_KEYS.BOILERPLATES(slug)
            : PROBLEM_REDIS_KEYS.FULL_BOILERPLATES(slug);

        try {
            const cached = await this.redisManager.getPub().get(redisKey);
            if (cached) {
                const map = JSON.parse(cached);
                return map[language] || null;
            }

            logger.warn(`Cache miss for ${tier}: ${slug}. Triggering refresh...`);

            const problem = await this.problemRepository.findBySlug(slug);
            if (!problem) return null;

            const { bucket, folder } = this.parseStoragePath(problem.storagePath || MINIO_BUCKET_PROBLEMS);

            // Self-healing: Trigger background refresh from ProblemSyncService
            this.syncService.refreshBoilerplateCache(slug, folder, bucket).catch(err =>
                logger.error(`Self-healing refresh failed for ${slug}: ${err.message}`)
            );

            const ext = (LANGUAGE_EXTENSIONS as any)[language];
            if (!ext) throw new ApiError(`Unsupported language: ${language}`, StatusCodes.BAD_REQUEST);

            const rawBoilerplate = await this.storageService.getFile(`${folder}/${tier}/function.${ext}`, bucket);
            return normalizeContent(rawBoilerplate);
        } catch (err: any) {
            logger.error(`Error in getCachedBoilerplate(${tier}) for ${slug}/${language}: ${err}`);
            throw new ApiError(`Failed to retrieve ${tier}: ${err.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
