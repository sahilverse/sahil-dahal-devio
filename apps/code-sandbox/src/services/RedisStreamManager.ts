import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

export class RedisStreamManager {
    private subscriber: Redis;
    private callbacks: Map<string, { onExecute: (data: any) => void, onInput: (data: string) => void }> = new Map();

    constructor(private redisClient: Redis) {
        this.subscriber = redisClient.duplicate();
        this.setupListener();
    }

    private setupListener() {
        this.subscriber.on('message', (channel, message) => {
            if (channel.startsWith('sandbox:command:')) {
                const sessionId = channel.replace('sandbox:command:', '');
                const sessionCallbacks = this.callbacks.get(sessionId);

                if (sessionCallbacks) {
                    try {
                        const payload = JSON.parse(message);
                        logger.info(`Session ${sessionId}: Redis command received [${payload.type}]`);

                        if (payload.type === 'execute') {
                            sessionCallbacks.onExecute(payload.data);
                        } else if (payload.type === 'input') {
                            sessionCallbacks.onInput(payload.data);
                        }
                    } catch (err) {
                        logger.error(`Error parsing Redis command message for session ${sessionId}: ${err}`);
                    }
                }
            }
        });

        this.subscriber.on('error', (err) => {
            logger.error(`Redis subscriber error in Sandbox: ${err.message}`);
        });
    }

    /**
     * Publishes output from the container to a Redis channel for the backend to consume.
     */
    async publishOutput(sessionId: string, type: 'stdout' | 'stderr' | 'exit' | 'error', data: any) {
        const channel = `sandbox:output:${sessionId}`;
        const payload = JSON.stringify({ type, data, timestamp: Date.now() });
        await this.redisClient.publish(channel, payload);
    }

    /**
     * Subscribes to commands (execute, input) from the backend/user for a specific session.
     */
    async subscribeToCommands(sessionId: string, onExecute: (data: any) => void, onInput: (data: string) => void) {
        const channel = `sandbox:command:${sessionId}`;

        this.callbacks.set(sessionId, { onExecute, onInput });
        await this.subscriber.subscribe(channel);

        logger.info(`Subscribed to commands for session ${sessionId}`);
    }

    async unsubscribeFromCommands(sessionId: string) {
        const channel = `sandbox:command:${sessionId}`;
        await this.subscriber.unsubscribe(channel);
        this.callbacks.delete(sessionId);
        logger.info(`Unsubscribed from commands for session ${sessionId}`);
    }

    /**
     * Persists session metadata to Redis for high availability.
     */
    async saveSession(sessionId: string, session: any) {
        const key = `sandbox:session:${sessionId}`;
        await this.redisClient.setex(key, 3600, JSON.stringify(session));
    }

    async getSession(sessionId: string): Promise<any | null> {
        const key = `sandbox:session:${sessionId}`;
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    async removeSession(sessionId: string) {
        const key = `sandbox:session:${sessionId}`;
        await this.redisClient.del(key);
    }

    async getAllSessionIds(): Promise<string[]> {
        const keys = await this.redisClient.keys('sandbox:session:*');
        return keys.map(key => key.replace('sandbox:session:', ''));
    }
}
