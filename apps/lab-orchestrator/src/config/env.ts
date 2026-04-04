import "dotenv/config";

export const config = {
    port: process.env.PORT!,
    dockerSocket: process.env.DOCKER_SOCKET_PATH || "/var/run/docker.sock",
    networkName: process.env.DOCKER_NETWORK!,
    redisUrl: process.env.REDIS_URL!,
    minio: {
        endpoint: process.env.MINIO_ENDPOINT!,
        region: process.env.S3_REGION!,
        accessKey: process.env.MINIO_ROOT_USER!,
        secretKey: process.env.MINIO_ROOT_PASSWORD!,
        bucket: process.env.MINIO_BUCKET_LABS!,
    }
};
