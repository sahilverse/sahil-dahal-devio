import pino from "pino";
import { LOG_LEVEL } from "../config/constants";

export const logger = pino({
    name: "devio-transcoder",
    level: LOG_LEVEL,
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
        },
    },
});
