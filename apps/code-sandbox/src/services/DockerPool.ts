import Docker from 'dockerode';
import { LANGUAGE_CONFIG } from '../config/languages';
import { logger } from '../utils';

export interface PoolConfig {
    maxPoolSize: number;
    initialPoolSize: number;
    idleTimeout: number;
}

class DockerPool {
    private pools: Map<string, Docker.Container[]> = new Map();
    private cleanupInterval: NodeJS.Timeout;
    private initializationPromise: Promise<void>;

    constructor(private docker: Docker, private config: PoolConfig) {
        this.config = {
            maxPoolSize: config.maxPoolSize || 3,
            initialPoolSize: config.initialPoolSize || 1,
            idleTimeout: config.idleTimeout || 300000,
        };

        this.initializePools();

        this.initializationPromise = (async () => {
            await this.cleanupExistingContainers().catch(err => {
                logger.error('Error during initial cleanup:', err);
            });

            await this.initializeContainers().catch(err => {
                logger.error('Error during container initialization:', err);
            });
        })();

        this.cleanupInterval = setInterval(() => {
            this.cleanupIdleContainers().catch(err => {
                logger.error('Error during idle cleanup:', err);
            });
        }, 30 * 1000);
    }

    private initializePools(): void {
        for (const language of Object.keys(LANGUAGE_CONFIG)) {
            this.pools.set(language, []);
        }
        logger.info('Initialized empty pools for all languages');
    }

    async waitForInitialization(): Promise<void> {
        await this.initializationPromise;
    }

    private async initializeContainers(): Promise<void> {
        logger.info('Initializing container pools...');

        for (const [language] of this.pools) {
            for (let i = 0; i < this.config.initialPoolSize; i++) {
                try {
                    const container = await this.createContainer(language);
                    this.pools.get(language)!.push(container);
                    logger.debug(`Created initial container for ${language}`);
                } catch (err: any) {
                    logger.error(`Failed to create initial container for ${language}:`, err);
                }
            }
        }

        logger.info('Container pool initialization completed');
    }

    private async cleanupExistingContainers(): Promise<void> {
        try {
            const containers = await this.docker.listContainers({ all: true });
            const sandboxContainers = containers.filter(containerInfo => {
                const imageNames = Object.values(LANGUAGE_CONFIG).map(config => config.image);
                return containerInfo.Image && imageNames.includes(containerInfo.Image);
            });

            logger.info(`Found ${sandboxContainers.length} existing sandbox containers to clean up.`);

            for (const containerInfo of sandboxContainers) {
                const container = this.docker.getContainer(containerInfo.Id);
                try {
                    if (containerInfo.State === 'running') {
                        await container.stop();
                    }
                    await container.remove();
                    logger.info(`Removed container ${containerInfo.Id} (${containerInfo.Names.join(', ')})`);
                } catch (err: any) {
                    logger.error(`Error removing container ${containerInfo.Id}:`, err);
                }
            }

        } catch (err: any) {
            logger.error('Error during cleanup of existing containers:', err);
        }
    }

    private async createContainer(language: string): Promise<Docker.Container> {
        const config = LANGUAGE_CONFIG[language];
        if (!config) throw new Error(`Unsupported language: ${language}`);

        const container = await this.docker.createContainer({
            Image: config.image,
            Cmd: ['sleep', 'infinity'],
            HostConfig: {
                Memory: 256 * 1024 * 1024,
                CpuPeriod: 100000,
                CpuQuota: 50000,
                NetworkMode: 'none',
                AutoRemove: false
            },
            User: 'sandboxuser',
            WorkingDir: '/home/sandboxuser/tmp'
        });

        await container.start();
        logger.debug(`Created and started container for ${language}: ${container.id}`);

        return container;
    }

    async getContainer(language: string): Promise<Docker.Container> {
        const pool = this.pools.get(language);
        if (!pool) throw new Error(`No pool found for language: ${language}`);

        if (pool.length > 0) {
            const container = pool.pop()!;
            logger.debug(`Reusing container for ${language} (${pool.length} remaining)`);
            return container;
        }

        const totalContainers = await this.getTotalContainers(language);
        if (totalContainers < this.config.maxPoolSize) {
            logger.debug(`Creating new container for ${language} (pool empty)`);
            return await this.createContainer(language);
        }

        logger.debug(`Waiting for container for ${language}...`);
        return await this.waitForContainer(language);
    }

    async returnContainer(language: string, container: Docker.Container): Promise<void> {
        const pool = this.pools.get(language);
        if (!pool) throw new Error(`No pool found for language: ${language}`);

        await this.cleanContainer(container);

        if (pool.length < this.config.initialPoolSize) {
            pool.push(container);
            logger.debug(`Returned container to ${language} pool (${pool.length} available, keeping warm)`);
        } else {
            const totalContainers = await this.getTotalContainers(language);
            if (totalContainers <= this.config.maxPoolSize) {
                pool.push(container);
                logger.debug(`Returned container to ${language} pool (${pool.length} available)`);
            } else {
                logger.debug(`Removing excess container for ${language}`);
                await this.destroyContainer(container);
            }
        }
    }

    private async cleanContainer(container: Docker.Container): Promise<void> {
        try {
            const exec = await container.exec({
                Cmd: ['sh', '-c', 'rm -rf /home/sandboxuser/tmp/*'],
                User: 'sandboxuser',
                WorkingDir: '/home/sandboxuser/tmp'
            });

            await new Promise((resolve, reject) => {
                let resolved = false;
                const timeoutHandle = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve(undefined);
                    }
                }, 10000);

                exec.start({}, (err: any, stream: any) => {
                    if (err) {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeoutHandle);
                            reject(err);
                        }
                        return;
                    }

                    const handleCompletion = () => {
                        if (resolved) return;
                        resolved = true;
                        clearTimeout(timeoutHandle);
                        resolve(undefined);
                    };

                    stream?.on('end', handleCompletion);
                    stream?.on('close', handleCompletion);
                    stream?.on('error', (error: any) => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeoutHandle);
                            reject(error);
                        }
                    });

                    setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeoutHandle);
                            resolve(undefined);
                        }
                    }, 5000);
                });
            });
        } catch (err: any) {
            logger.warn('Failed to clean container:', err);
        }
    }

    private async waitForContainer(language: string, timeout: number = 10000): Promise<Docker.Container> {
        return new Promise((resolve, reject) => {
            const pool = this.pools.get(language)!;
            const startTime = Date.now();

            const checkInterval = setInterval(() => {
                if (pool.length > 0) {
                    clearInterval(checkInterval);
                    const container = pool.pop()!;
                    resolve(container);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Timeout waiting for ${language} container`));
                }
            }, 100);
        });
    }

    private async getTotalContainers(language: string): Promise<number> {
        const pool = this.pools.get(language) || [];
        const containers = await this.docker.listContainers();
        const languageContainers = containers.filter(containerInfo =>
            containerInfo.Image === LANGUAGE_CONFIG[language]?.image
        );
        return pool.length + languageContainers.length;
    }

    private async cleanupIdleContainers(): Promise<void> {
        for (const [language, pool] of this.pools.entries()) {
            const totalContainers = await this.getTotalContainers(language);
            const maxRemovable = Math.max(0, totalContainers - this.config.initialPoolSize);

            if (maxRemovable > 0 && pool.length > this.config.initialPoolSize) {
                const toRemove = pool.length - this.config.initialPoolSize;
                logger.debug(`Removing ${toRemove} excess containers for ${language}, keeping ${this.config.initialPoolSize} warm`);
                for (let i = 0; i < toRemove; i++) {
                    const container = pool.pop()!;
                    await this.destroyContainer(container);
                }
            }
        }
    }

    private async destroyContainer(container: Docker.Container): Promise<void> {
        try {
            await container.stop();
            await container.remove();
            logger.debug(`Destroyed container: ${container.id}`);
        } catch (err: any) {
            logger.error('Error destroying container:', err);
        }
    }

    getPoolStats(): Record<string, { available: number; maxSize: number }> {
        const stats: Record<string, { available: number; maxSize: number }> = {};
        for (const [language, pool] of this.pools.entries()) {
            stats[language] = {
                available: pool.length,
                maxSize: this.config.maxPoolSize
            };
        }
        return stats;
    }

    async shutdown(): Promise<void> {
        clearInterval(this.cleanupInterval);
        logger.info('Shutting down Docker pool...');

        const cleanupPromises: Promise<void>[] = [];
        for (const [language, pool] of this.pools.entries()) {
            logger.info(`Cleaning up ${language} pool (${pool.length} containers)`);
            for (const container of pool) {
                cleanupPromises.push(this.destroyContainer(container));
            }
            this.pools.set(language, []);
        }

        await Promise.all(cleanupPromises);
        logger.info('Docker pool shutdown complete');
    }
}

export default DockerPool;