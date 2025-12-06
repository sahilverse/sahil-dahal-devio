import Redis from "ioredis";
import { REDIS_URL } from "../config/constants";
import { logger } from "../utils";

export class RedisManager {
    private static pubClient: Redis | null = null;
    private static subClient: Redis | null = null;
    private static isInitialized = false;

    static async init(): Promise<void> {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.pubClient = new Redis(REDIS_URL, {
            lazyConnect: true,
            retryStrategy(times: number) {
                return Math.min(times * 100, 3000);
            },
        });

        this.subClient = this.pubClient.duplicate();

        await this.pubClient.connect();
        await this.subClient.connect();

        logger.info("Connected to Redis");
    }

    static getPub(): Redis {
        if (!this.pubClient)
            throw new Error("Call RedisManager.init() first.");
        return this.pubClient;
    }

    static getSub(): Redis {
        if (!this.subClient)
            throw new Error("Call RedisManager.init() first.");
        return this.subClient;
    }

    static async disconnect(): Promise<void> {
        if (this.pubClient) await this.pubClient.quit();
        if (this.subClient) await this.subClient.quit();
        logger.info("Disconnected from Redis");
    }
}
