import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { S3Client } from '@aws-sdk/client-s3';
import * as tar from 'tar-stream';
import { ApiError } from '../utils/ApiError';

const dockerMocks = vi.hoisted(() => ({
    listNetworks: vi.fn(),
    createNetwork: vi.fn(),
    buildImage: vi.fn(),
    listImages: vi.fn(),
    pull: vi.fn(),
    createContainer: vi.fn(),
    getContainer: vi.fn(),
    modem: { followProgress: vi.fn() }
}));

vi.mock('../config/env', () => ({
    config: {
        dockerSocket: '/var/run/docker.sock',
        networkName: 'devio-lab-network',
        minio: {
            endpoint: 'http://localhost:9000',
            region: 'us-east-1',
            accessKey: 'minioadmin',
            secretKey: 'minioadmin',
            bucket: 'labs'
        }
    }
}));

vi.mock('dockerode', () => {
    const DockerMock = function() { return dockerMocks; };
    return { default: DockerMock };
});
vi.mock('@aws-sdk/client-s3');
vi.mock('tar-stream', () => ({
    pack: vi.fn(() => ({ entry: vi.fn(), finalize: vi.fn() }))
}));
vi.mock('../utils/logger');

import { DockerService } from '../services/DockerService';

describe('DockerService Unit Tests', () => {
    let dockerService: DockerService;
    let mockS3Client: any;
    let mockContainer: any;

    beforeEach(() => {
        vi.useFakeTimers();

        mockContainer = {
            id: 'test-container',
            start: vi.fn().mockResolvedValue({}),
            stop: vi.fn().mockResolvedValue({}),
            inspect: vi.fn().mockResolvedValue({
                State: { Running: true },
                NetworkSettings: {
                    Networks: {
                        'devio-lab-network': { IPAddress: '192.168.1.100' }
                    }
                }
            })
        };

        dockerMocks.listNetworks.mockResolvedValue([]);
        dockerMocks.createNetwork.mockResolvedValue({});
        dockerMocks.buildImage.mockResolvedValue({});
        dockerMocks.listImages.mockResolvedValue([]);
        dockerMocks.pull.mockImplementation((image: any, cb: any) => cb(null, {}));
        dockerMocks.createContainer.mockResolvedValue(mockContainer);
        dockerMocks.getContainer.mockReturnValue(mockContainer);
        dockerMocks.modem.followProgress.mockImplementation((stream: any, onFinished: any) => onFinished(null, [{ stream: 'build success' }]));

        mockS3Client = {
            send: vi.fn().mockResolvedValue({
                Body: {
                    transformToString: vi.fn().mockResolvedValue('FROM ubuntu\nRUN echo "hello"')
                }
            })
        };

        (S3Client as any).mockImplementation(function() { return mockS3Client; });

        dockerService = new DockerService();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('initializeNetwork', () => {
        it('should create a network if it does not exist', async () => {
             await dockerService.initializeNetwork();
             expect(dockerMocks.listNetworks).toHaveBeenCalled();
             expect(dockerMocks.createNetwork).toHaveBeenCalledWith({
                 Name: 'devio-lab-network',
                 Driver: 'bridge'
             });
        });

        it('should do nothing if network already exists', async () => {
            dockerMocks.listNetworks.mockResolvedValue([{ Name: 'devio-lab-network' }]);
            await dockerService.initializeNetwork();
            expect(dockerMocks.listNetworks).toHaveBeenCalled();
            expect(dockerMocks.createNetwork).not.toHaveBeenCalled();
        });
    });

    describe('buildImageFromMinio', () => {
        it('should fetch dockerfile from S3, pack it, and trigger Docker buildImage', async () => {
            await dockerService.buildImageFromMinio('test-image:latest', 'dockerfiles/Dockerfile');
            
            expect(mockS3Client.send).toHaveBeenCalled();
            expect(tar.pack).toHaveBeenCalled();
            expect(dockerMocks.buildImage).toHaveBeenCalled();
            expect(dockerMocks.modem.followProgress).toHaveBeenCalled();
        });

        it('should throw ApiError if S3 fetch fails or dockerfile is empty', async () => {
            mockS3Client.send.mockResolvedValue({
                Body: {
                    transformToString: vi.fn().mockResolvedValue('')
                }
            });

            await expect(dockerService.buildImageFromMinio('test-image', 'dock.file')).rejects.toThrow(ApiError);
        });
    });

    describe('provisionInstance', () => {
        it('should pull image if it does not exist locally and no dockerfile is provided', async () => {
            await dockerService.provisionInstance('room-1', 'user-1', 'ubuntu:latest');

            expect(dockerMocks.listImages).toHaveBeenCalled();
            expect(dockerMocks.pull).toHaveBeenCalledWith('ubuntu:latest', expect.any(Function));
            expect(dockerMocks.createContainer).toHaveBeenCalled();
            expect(mockContainer.start).toHaveBeenCalled();
            expect(mockContainer.inspect).toHaveBeenCalled();
        });

        it('should build image if it does not exist and dockerfile is provided', async () => {
            await dockerService.provisionInstance('room-1', 'user-1', 'custom-img:1.0', 'path/Dockerfile');

            expect(dockerMocks.listImages).toHaveBeenCalled();
            expect(dockerMocks.pull).not.toHaveBeenCalled();
            expect(mockS3Client.send).toHaveBeenCalled();
            expect(dockerMocks.createContainer).toHaveBeenCalled();
        });

        it('should return instance details with IP address upon successful creation', async () => {
            dockerMocks.listImages.mockResolvedValue([{ RepoTags: ['ubuntu:latest'] }]);
            
            const result = await dockerService.provisionInstance('room-1', 'user-1', 'ubuntu:latest');

            expect(result).toHaveProperty('instanceId', 'test-container');
            expect(result).toHaveProperty('status', 'RUNNING');
            expect(result).toHaveProperty('ipAddress', '192.168.1.100');
        });
    });

    describe('terminateInstance', () => {
        it('should stop container if it is running', async () => {
            const result = await dockerService.terminateInstance('test-container');
            expect(dockerMocks.getContainer).toHaveBeenCalledWith('test-container');
            expect(mockContainer.inspect).toHaveBeenCalled();
            expect(mockContainer.stop).toHaveBeenCalledWith({ t: 2 });
            expect(result).toBe(true);
        });

        it('should handle 404 errors gracefully indicating container already terminated', async () => {
            mockContainer.inspect.mockRejectedValue({ statusCode: 404 });
            const result = await dockerService.terminateInstance('non-existing-container');
            expect(result).toBe(true);
        });
    });

    describe('getInstanceStatus', () => {
        it('should return RUNNING and IP address if container is up', async () => {
            const result = await dockerService.getInstanceStatus('test-container');
            expect(result.status).toBe('RUNNING');
            expect(result.ipAddress).toBe('192.168.1.100');
        });

        it('should return TERMINATED if container is not found (404)', async () => {
            mockContainer.inspect.mockRejectedValue({ statusCode: 404 });
            const result = await dockerService.getInstanceStatus('test-container');
            expect(result.status).toBe('TERMINATED');
            expect(result.ipAddress).toBeNull();
        });
    });
});
