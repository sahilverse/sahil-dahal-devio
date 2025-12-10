import type { Request } from "express";
import { UAParser } from "ua-parser-js";
import { UserAgentInfo } from "../modules/auth";

export class RequestUtil {
    static getClientIp(req: Request): string | null {
        const xForwardedFor = req.headers["x-forwarded-for"];
        if (xForwardedFor) {
            const ips = Array.isArray(xForwardedFor)
                ? xForwardedFor
                : xForwardedFor.split(",");

            return ips.length > 0 ? ips[0]?.trim() ?? null : null;
        }

        return req.socket.remoteAddress || null;
    }

    static getUserAgent(req: Request): UserAgentInfo {
        const rawUA = req.get("user-agent") || null;

        if (!rawUA) {
            return {
                browser: null,
                version: null,
                os: null,
                device: null,
                raw: null,
            };
        }

        const parser = new UAParser(rawUA);
        const result = parser.getResult();

        const browser = result.browser.name || null;
        const version = result.browser.version || null;
        const os = result.os.name
            ? `${result.os.name} ${result.os.version || ""}`.trim()
            : null;
        const device = result.device.type || "Desktop";

        return {
            browser,
            version,
            os,
            device,
            raw: rawUA,
        };
    }


    static getIpAndUserAgent(req: Request): Readonly<{
        ip: string | null;
        userAgent: UserAgentInfo;
    }> {
        return {
            ip: this.getClientIp(req),
            userAgent: this.getUserAgent(req),
        };
    }
}