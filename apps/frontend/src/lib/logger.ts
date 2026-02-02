import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
    level: isProduction ? "info" : "debug",
    browser: {
        asObject: true,
    },

    transport: !isProduction ? {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    } : undefined
});
