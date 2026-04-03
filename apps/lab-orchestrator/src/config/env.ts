import "dotenv/config";

export const config = {
    port: process.env.PORT!,
    dockerSocket: process.env.DOCKER_SOCKET_PATH!,
    networkName: process.env.DOCKER_NETWORK!,
    redisUrl: process.env.REDIS_URL!
};
