import Redis from "ioredis";
import { REDIS_URL } from "../config/constants";
import { injectable } from "inversify";
import { logger } from "../utils";

@injectable()
export class RedisManager {
    private pubClient!: Redis;
    private subClient!: Redis;
    private isInitialized = false;

    async init(): Promise<void> {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.pubClient = new Redis(REDIS_URL, {
            lazyConnect: true,
            retryStrategy(times: number) {
                return Math.min(times * 100, 3000);
            },
            maxRetriesPerRequest: null,
        });

        this.subClient = this.pubClient.duplicate();

        await this.pubClient.connect();
        await this.subClient.connect();

        logger.info("Connected to Redis");
    }

    getPub(): Redis {
        if (!this.pubClient)
            throw new Error("Redis not initialized. Call init() first.");
        return this.pubClient;
    }

    getSub(): Redis {
        if (!this.subClient)
            throw new Error("Redis not initialized. Call init() first.");
        return this.subClient;
    }

    async disconnect(): Promise<void> {
        if (this.pubClient) await this.pubClient.quit();
        if (this.subClient) await this.subClient.quit();
        logger.info("Disconnected from Redis");
    }
}
