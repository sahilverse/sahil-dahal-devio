import Docker from "dockerode";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

export class DockerService {
    private docker: Docker;

    constructor() {
        this.docker = new Docker({ socketPath: config.dockerSocket });
    }

    async initializeNetwork() {
        try {
            const networks = await this.docker.listNetworks();
            const exists = networks.find((n) => n.Name === config.networkName);
            if (!exists) {
                logger.info(`Creating Docker network: ${config.networkName}`);
                await this.docker.createNetwork({
                    Name: config.networkName,
                    Driver: "bridge",
                });
            } else {
                logger.info(`Network ${config.networkName} already exists.`);
            }
        } catch (error: any) {
            logger.error("Failed to initialize Docker network:", error);
            throw new ApiError(`Docker Network Error: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async provisionInstance(roomId: string, userId: string, imageId: string) {
        const containerName = `devio-lab-${roomId}-${userId}-${Date.now()}`;

        try {
            const images = await this.docker.listImages();
            const imageExists = images.find(
                (i) => i.RepoTags?.includes(imageId) || i.RepoTags?.includes(`${imageId}:latest`)
            );
            
            if (!imageExists) {
                logger.info(`Pulling image ${imageId}...`);
                await new Promise((resolve, reject) => {
                    this.docker.pull(imageId, (err: Error, stream: NodeJS.ReadableStream) => {
                        if (err) return reject(err);
                        this.docker.modem.followProgress(stream, onFinished);
                        function onFinished(err: Error | null, output: any) {
                            if (err) return reject(err);
                            resolve(output);
                        }
                    });
                });
            }

            logger.info(`Creating container ${containerName} from image ${imageId}...`);
            const container = (await this.docker.createContainer({
                Image: imageId,
                name: containerName,
                HostConfig: {
                    NetworkMode: config.networkName,
                    Memory: 512 * 1024 * 1024,
                    NanoCpus: 1 * 1e9,
                    AutoRemove: true,
                    
                },
                Tty: true, 
            })) as unknown as Docker.Container;

            await container.start();
            logger.info(`Container ${containerName} started successfully.`);

            const info = await container.inspect();
            const networks = info.NetworkSettings.Networks;
            const ipAddress = networks[config.networkName]?.IPAddress || null;

            return {
                instanceId: container.id,
                name: containerName,
                ipAddress,
                status: "RUNNING",
            };
        } catch (error: any) {
            logger.error(`Error starting instance ${containerName}:`, error);
            throw new ApiError(`Provisioning Failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async terminateInstance(instanceId: string) {
        try {
            const container = this.docker.getContainer(instanceId);
            const info = await container.inspect();
            if (info.State.Running) {
                logger.info(`Stopping container ${instanceId}...`);
                await container.stop({ t: 2 });
            }
            logger.info(`Container ${instanceId} terminated.`);
            return true;
        } catch (error: any) {
            if (error.statusCode === 404) {
                 logger.info(`Container ${instanceId} not found, already terminated or AutoRemoved.`);
                 return true;
            }
            logger.error(`Error terminating instance ${instanceId}:`, error);
            throw new ApiError(`Termination Failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getInstanceStatus(instanceId: string) {
        try {
            const container = this.docker.getContainer(instanceId);
            const info = await container.inspect();
            return {
                status: info.State.Running ? "RUNNING" : "STOPPED",
                ipAddress: info.NetworkSettings.Networks[config.networkName]?.IPAddress || null,
            };
        } catch (error: any) {
            if (error.statusCode === 404) {
                return { status: "TERMINATED", ipAddress: null };
            }
            throw new ApiError(`Status Check Failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
