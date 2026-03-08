import "dotenv/config";

export const config = {
    port: process.env.PORT || 5500,
    dockerSocket: process.env.DOCKER_SOCKET_PATH || (process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock"),
    networkName: process.env.DOCKER_NETWORK || "devio_labs_network",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
};
