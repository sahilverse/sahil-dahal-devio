import Docker from "dockerode";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import * as tar from "tar-stream";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

export class DockerService {
    private docker: Docker;
    private s3Client: S3Client;

    constructor() {
        this.docker = new Docker({ socketPath: config.dockerSocket });

        this.s3Client = new S3Client({
            endpoint: config.minio.endpoint,
            region: config.minio.region,
            credentials: {
                accessKeyId: config.minio.accessKey,
                secretAccessKey: config.minio.secretKey,
            },
            forcePathStyle: true,
        });
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

    async buildImageFromMinio(imageId: string, dockerfilePath: string) {
        try {
            logger.info(`Starting on-demand build for ${imageId} from ${dockerfilePath}`);

            // 1. Download Dockerfile from MinIO (private bucket)
            const command = new GetObjectCommand({
                Bucket: config.minio.bucket,
                Key: dockerfilePath,
            });
            const response = await this.s3Client.send(command);
            const dockerfileContent = await response.Body?.transformToString('utf-8');

            if (!dockerfileContent) {
                throw new Error(`Dockerfile is empty or not found at ${dockerfilePath}`);
            }

            // 2. Create tar stream for build context
            const pack = tar.pack();
            pack.entry({ name: 'Dockerfile' }, dockerfileContent);
            pack.finalize();

            // 3. Trigger Docker build
            const stream = await this.docker.buildImage(pack, { t: imageId });

            await new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err, output) => {
                    if (err) return reject(err);
                    resolve(output);
                });
            });

            logger.info(`Successfully built image: ${imageId}`);
        } catch (error: any) {
            logger.error(`Failed to build image ${imageId}:`, error);
            throw new ApiError(`Image Build Failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async provisionInstance(roomId: string, userId: string, imageId: string, dockerfilePath?: string) {
        const containerName = `devio-lab-${roomId}-${userId}-${Date.now()}`;

        try {
            const images = await this.docker.listImages();
            const imageExists = images.find(
                (i) => i.RepoTags?.includes(imageId) || i.RepoTags?.includes(`${imageId}:latest`)
            );

            if (!imageExists) {
                if (dockerfilePath) {
                    await this.buildImageFromMinio(imageId, dockerfilePath);
                } else {
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
