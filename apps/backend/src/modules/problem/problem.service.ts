import { injectable, inject } from "inversify";
import { ProblemRepository } from "./problem.repository";
import { StorageService } from "../storage/storage.service";
import { TopicService } from "../topic/topic.service";
import { TYPES } from "../../types";
import { logger } from "../../utils";
import slugify from "slugify";
import { BoilerplateFactory, ProblemStructure, LANGUAGE_EXTENSIONS } from "@devio/boilerplate-generator";
import { Difficulty } from "../../generated/prisma/client";
import { plainToInstance } from "class-transformer";
import { ProblemResponseDTO } from "./problem.dto";
import { RedisManager } from "../../config/redis";
import { ProblemDraftService } from "../problem-draft";
import { MINIO_BUCKET_PROBLEMS } from "../../config/constants";

const REDIS_TTL = 60 * 60 * 24 * 7;

@injectable()
export class ProblemService {
    constructor(
        @inject(TYPES.ProblemRepository) private problemRepository: ProblemRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.TopicService) private topicService: TopicService,
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
        @inject(TYPES.ProblemDraftService) private draftService: ProblemDraftService
    ) { }

    private parseStoragePath(storagePath: string): { bucket: string; folder: string } {
        const bucket = storagePath.split('/')[0] || MINIO_BUCKET_PROBLEMS;
        const folder = storagePath.replace(`${bucket}/`, "");
        return { bucket, folder };
    }

    async handleMinioEvent(bucket: string, key: string): Promise<void> {
        if (!key.endsWith("structure.json") || key.includes("/boilerplate/")) return;

        logger.info(`Processing problem: ${key} in bucket ${bucket}`);

        try {
            const content = await this.storageService.getFile(key, bucket);
            const structureData = JSON.parse(content);

            const slug = slugify(structureData.title, { lower: true, strict: true });
            const problemFolder = key.replace("/structure.json", "");
            const storagePath = `${bucket}/${slug}`;

            let richDescription: string;
            try {
                richDescription = await this.storageService.getFile(`${problemFolder}/description.md`, bucket);
            } catch {
                richDescription = structureData.description || "No description provided.";
                if (!structureData.description) {
                    logger.warn(`No description found for: ${structureData.title}`);
                }
            }

            const boilerplateStruct: ProblemStructure = {
                problemName: structureData.title,
                functionName: structureData.functionName,
                inputStructure: structureData.inputStructure,
                outputStructure: structureData.outputStructure,
            };

            const { ui, full } = BoilerplateFactory.generateAll(boilerplateStruct);

            for (const [lang, code] of Object.entries(ui)) {
                const ext = (LANGUAGE_EXTENSIONS as any)[lang];
                await this.storageService.uploadBuffer(Buffer.from(code as string), `${problemFolder}/boilerplate/function.${ext}`, "text/plain", bucket);
            }

            for (const [lang, code] of Object.entries(full)) {
                const ext = (LANGUAGE_EXTENSIONS as any)[lang];
                await this.storageService.uploadBuffer(Buffer.from(code as string), `${problemFolder}/boilerplate-full/function.${ext}`, "text/plain", bucket);
            }

            const topicIds: string[] = [];
            if (structureData.topics && Array.isArray(structureData.topics)) {
                for (const topicName of structureData.topics) {
                    const topic = await this.topicService.createTopic(topicName);
                    if (topic) topicIds.push(topic.id);
                }
            }

            const testCasesData: any[] = [];
            if (structureData.testCases) {
                for (const [visibility, isPublic] of [["public", true], ["private", false]] as const) {
                    const cases = structureData.testCases[visibility];
                    if (Array.isArray(cases)) {
                        const offset = testCasesData.length;
                        cases.forEach((tc: any, index: number) => {
                            testCasesData.push({
                                inputPath: tc.input,
                                outputPath: tc.output,
                                isPublic,
                                order: offset + index
                            });
                        });
                    }
                }
            }

            const result = await this.problemRepository.syncProblemWithRelations({
                slug,
                title: structureData.title,
                difficulty: structureData.difficulty as Difficulty,
                description: richDescription,
                storagePath,
                isPublished: structureData.publish || false,
                topicIds,
                testCases: testCasesData
            });

            if (result.testCases && result.testCases.length > 0) {
                this.cacheSamples(slug, result.testCases, bucket).catch(err =>
                    logger.error(`Background cache failed for ${slug}: ${err.message}`)
                );
            }

            // Cache both boilerplate tiers in Redis
            const redis = this.redisManager.getPub();
            redis.set(`problem:${slug}:boilerplates`, JSON.stringify(ui), "EX", REDIS_TTL).catch(err =>
                logger.error(`Failed to cache UI boilerplates for ${slug}: ${err.message}`)
            );
            redis.set(`problem:${slug}:boilerplates:full`, JSON.stringify(full), "EX", REDIS_TTL).catch(err =>
                logger.error(`Failed to cache full boilerplates for ${slug}: ${err.message}`)
            );

            logger.info(`Successfully processed problem: ${structureData.title} (${slug})`);
        } catch (error: any) {
            logger.error(`Error processing problem event for ${key}: ${error.message}`);
        }
    }

    async getProblemBySlug(slug: string): Promise<ProblemResponseDTO | null> {
        const problem = await this.problemRepository.findBySlug(slug);
        if (!problem) return null;

        const dto = plainToInstance(ProblemResponseDTO, problem, { excludeExtraneousValues: true });

        try {
            const cached = await this.redisManager.getPub().get(`problem:${slug}:samples`);

            if (cached) {
                dto.testCases = JSON.parse(cached).map((s: any) => ({
                    id: s.id, input: s.input, output: s.output
                }));
            } else {
                logger.warn(`Cache miss for samples: ${slug}. Triggering refresh...`);
                const { bucket } = this.parseStoragePath(problem.storagePath || MINIO_BUCKET_PROBLEMS);
                const publicCases = await this.problemRepository.getSampleTestCases(problem.id);

                if (publicCases.length > 0) {
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
                const input = await this.storageService.getFile(tc.inputPath, bucket);
                const output = await this.storageService.getFile(tc.outputPath, bucket);
                sampleCases.push({ id: tc.id, input, output });
            } catch (err: any) {
                logger.error(`Failed to fetch test case (ID: ${tc.id}): ${err.message}`);
            }
        }

        if (sampleCases.length > 0) {
            await this.redisManager.getPub().set(`problem:${slug}:samples`, JSON.stringify(sampleCases), "EX", REDIS_TTL);
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
            ? `problem:${slug}:boilerplates`
            : `problem:${slug}:boilerplates:full`;

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

            this.refreshBoilerplateCache(slug, folder, bucket).catch(err =>
                logger.error(`Self-healing refresh failed for ${slug}: ${err.message}`)
            );

            const ext = (LANGUAGE_EXTENSIONS as any)[language];
            if (!ext) return null;

            return await this.storageService.getFile(`${folder}/${tier}/function.${ext}`, bucket);
        } catch (err) {
            logger.error(`Error in getCachedBoilerplate(${tier}) for ${slug}/${language}: ${err}`);
            return null;
        }
    }

    private async refreshBoilerplateCache(slug: string, problemFolder: string, bucket: string): Promise<void> {
        const uiMap: Record<string, string> = {};
        const fullMap: Record<string, string> = {};

        for (const [lang, ext] of Object.entries(LANGUAGE_EXTENSIONS)) {
            try { uiMap[lang] = await this.storageService.getFile(`${problemFolder}/boilerplate/function.${ext}`, bucket); } catch { }
            try { fullMap[lang] = await this.storageService.getFile(`${problemFolder}/boilerplate-full/function.${ext}`, bucket); } catch { }
        }

        const redis = this.redisManager.getPub();
        if (Object.keys(uiMap).length > 0) {
            await redis.set(`problem:${slug}:boilerplates`, JSON.stringify(uiMap), "EX", REDIS_TTL);
            logger.info(`Refreshed UI boilerplates for: ${slug}`);
        }
        if (Object.keys(fullMap).length > 0) {
            await redis.set(`problem:${slug}:boilerplates:full`, JSON.stringify(fullMap), "EX", REDIS_TTL);
            logger.info(`Refreshed full boilerplates for: ${slug}`);
        }
    }
}
