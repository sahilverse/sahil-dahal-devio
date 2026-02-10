import { injectable, inject } from "inversify";
import { ProblemRepository } from "./problem.repository";
import { StorageService } from "../storage/storage.service";
import { TopicService } from "../topic/topic.service";
import { TYPES } from "../../types";
import { logger } from "../../utils";
import slugify from "slugify";
import { BoilerplateFactory, ProblemStructure, LANGUAGE_EXTENSIONS } from "@devio/boilerplate-generator";
import { Difficulty } from "../../generated/prisma/client";
import { RedisManager } from "../../config/redis";
import { PROBLEM_REDIS_TTL, PROBLEM_REDIS_KEYS } from "../../config/constants";

@injectable()
export class ProblemSyncService {
    constructor(
        @inject(TYPES.ProblemRepository) private problemRepository: ProblemRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.TopicService) private topicService: TopicService,
        @inject(TYPES.RedisManager) private redisManager: RedisManager,
    ) { }

    async handleMinioEvent(bucket: string, key: string): Promise<void> {
        if (!key.endsWith("structure.json") || key.includes("/boilerplate")) return;

        logger.info(`Processing problem ingestion: ${key} in bucket ${bucket}`);

        try {
            const content = await this.storageService.getFile(key, bucket);
            const structureData = JSON.parse(content);
            const slug = slugify(structureData.title, { lower: true, strict: true });
            const problemFolder = key.replace("/structure.json", "");

            const storagePath = `${bucket}/${problemFolder}`;

            let richDescription: string;
            try {
                richDescription = await this.storageService.getFile(`${problemFolder}/description.md`, bucket);
            } catch {
                richDescription = structureData.description || "No description provided.";
            }

            const { ui, full } = await this.generateAndUploadBoilerplates(structureData, problemFolder, bucket);

            const topicIds: string[] = [];
            if (Array.isArray(structureData.topics)) {
                for (const name of structureData.topics) {
                    const topic = await this.topicService.createTopic(name);
                    if (topic) topicIds.push(topic.id);
                }
            }

            let testCasesData: any[] = [];
            if (structureData.testCases && Object.keys(structureData.testCases).length > 0) {
                testCasesData = this.parseManualTestCases(structureData.testCases, problemFolder);
            } else {
                testCasesData = await this.discoverTestCases(problemFolder, bucket);
            }

            const isPublished = !!structureData.publish;
            const result = await this.problemRepository.syncProblemWithRelations({
                slug,
                title: structureData.title,
                difficulty: structureData.difficulty as Difficulty,
                description: richDescription,
                storagePath,
                isPublished,
                topicIds,
                testCases: testCasesData
            });

            this.runBackgroundCaching(slug, result.testCases, ui, full, bucket);

            logger.info(`Successfully synced problem: ${structureData.title} (${slug})`);
        } catch (error: any) {
            logger.error(`Failed to process MinIO event for ${key}: ${error.message}`);
        }
    }

    private async generateAndUploadBoilerplates(structureData: any, problemFolder: string, bucket: string) {
        const boilerplateStruct: ProblemStructure = {
            problemName: structureData.title,
            functionName: structureData.functionName,
            inputStructure: structureData.inputStructure || [],
            outputStructure: structureData.outputStructure || {},
        };

        const { ui, full } = BoilerplateFactory.generateAll(boilerplateStruct);

        const uploadTasks = [
            ...Object.entries(ui).map(([lang, code]) => {
                const ext = (LANGUAGE_EXTENSIONS as any)[lang];
                return this.storageService.uploadBuffer(Buffer.from(code as string), `${problemFolder}/boilerplate/function.${ext}`, "text/plain", bucket);
            }),
            ...Object.entries(full).map(([lang, code]) => {
                const ext = (LANGUAGE_EXTENSIONS as any)[lang];
                return this.storageService.uploadBuffer(Buffer.from(code as string), `${problemFolder}/boilerplate-full/function.${ext}`, "text/plain", bucket);
            })
        ];

        await Promise.all(uploadTasks);
        return { ui, full };
    }

    private parseManualTestCases(testCases: any, problemFolder: string): any[] {
        const data: any[] = [];
        for (const [visibility, isPublic] of [["public", true], ["private", false]] as const) {
            const cases = testCases[visibility];
            if (Array.isArray(cases)) {
                const offset = data.length;
                cases.forEach((tc: any, index: number) => {
                    data.push({
                        inputPath: tc.input?.startsWith("/") ? tc.input.slice(1) : `${problemFolder}/${tc.input}`,
                        outputPath: tc.output?.startsWith("/") ? tc.output.slice(1) : `${problemFolder}/${tc.output}`,
                        isPublic,
                        order: offset + index
                    });
                });
            }
        }
        return data;
    }

    private runBackgroundCaching(slug: string, testCases: any[], ui: any, full: any, bucket: string) {
        if (testCases?.length > 0) {
            this.cacheSamples(slug, testCases, bucket).catch(err => logger.error(`Sample cache fail: ${err.message}`));
        }
        const redis = this.redisManager.getPub();
        redis.set(PROBLEM_REDIS_KEYS.BOILERPLATES(slug), JSON.stringify(ui), "EX", PROBLEM_REDIS_TTL).catch(() => { });
        redis.set(PROBLEM_REDIS_KEYS.FULL_BOILERPLATES(slug), JSON.stringify(full), "EX", PROBLEM_REDIS_TTL).catch(() => { });
    }

    private async cacheSamples(slug: string, testCases: any[], bucket: string): Promise<void> {
        const sampleCases = [];
        for (const tc of testCases) {
            try {
                const inputRaw = await this.storageService.getFile(tc.inputPath, bucket);
                const outputRaw = await this.storageService.getFile(tc.outputPath, bucket);

                // Normalizing: Remove all \r and strip trailing newlines
                const input = inputRaw.replace(/\r/g, "").trimEnd();
                const output = outputRaw.replace(/\r/g, "").trimEnd();

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

    async discoverTestCases(problemFolder: string, bucket: string): Promise<any[]> {
        const testCases: any[] = [];
        const tiers = [
            { folder: "public", isPublic: true },
            { folder: "private", isPublic: false }
        ];

        for (const tier of tiers) {
            const inputPrefix = `${problemFolder}/tests/inputs/${tier.folder}`;
            const outputPrefix = `${problemFolder}/tests/outputs/${tier.folder}`;

            const inputFiles = await this.storageService.listFiles(bucket, inputPrefix);
            const outputFiles = await this.storageService.listFiles(bucket, outputPrefix);

            const inputMap = new Map<string, string>();
            inputFiles.forEach(file => {
                const filename = file.split("/").pop();
                if (filename) inputMap.set(filename, file);
            });

            const pairs = [];
            for (const outputFile of outputFiles) {
                const filename = outputFile.split("/").pop();
                if (filename && inputMap.has(filename)) {
                    pairs.push({
                        id: filename.replace(/\.[^/.]+$/, ""),
                        input: inputMap.get(filename),
                        output: outputFile,
                        isPublic: tier.isPublic
                    });
                }
            }

            pairs.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

            const currentOffset = testCases.length;
            pairs.forEach((p, index) => {
                testCases.push({
                    inputPath: p.input,
                    outputPath: p.output,
                    isPublic: p.isPublic,
                    order: currentOffset + index
                });
            });
        }

        if (testCases.length > 0) {
            logger.info(`Discovered ${testCases.length} test cases automatically for ${problemFolder}`);
        }

        return testCases;
    }

    async refreshBoilerplateCache(slug: string, problemFolder: string, bucket: string): Promise<void> {
        const uiMap: Record<string, string> = {};
        const fullMap: Record<string, string> = {};

        for (const [lang, ext] of Object.entries(LANGUAGE_EXTENSIONS)) {
            try { uiMap[lang] = await this.storageService.getFile(`${problemFolder}/boilerplate/function.${ext}`, bucket); } catch { }
            try { fullMap[lang] = await this.storageService.getFile(`${problemFolder}/boilerplate-full/function.${ext}`, bucket); } catch { }
        }

        const redis = this.redisManager.getPub();
        if (Object.keys(uiMap).length > 0) {
            await redis.set(PROBLEM_REDIS_KEYS.BOILERPLATES(slug), JSON.stringify(uiMap), "EX", PROBLEM_REDIS_TTL);
            logger.info(`Refreshed UI boilerplates for: ${slug}`);
        }
        if (Object.keys(fullMap).length > 0) {
            await redis.set(PROBLEM_REDIS_KEYS.FULL_BOILERPLATES(slug), JSON.stringify(fullMap), "EX", PROBLEM_REDIS_TTL);
            logger.info(`Refreshed full boilerplates for: ${slug}`);
        }
    }
}
