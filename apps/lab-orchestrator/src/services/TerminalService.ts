import { WebSocket } from "ws";
import Docker from "dockerode";
import { config } from "../config/env";
import { logger } from "../utils/logger";

const docker = new Docker({ socketPath: config.dockerSocket });

export class TerminalService {
    static async handleConnection(ws: WebSocket, containerId: string) {
        try {
            logger.info(`Terminal connection requested for container: ${containerId}`);
            const container = docker.getContainer(containerId);

            // Try to find an available shell
            const tryShells = ["/bin/bash", "/bin/sh", "/bin/dash", "sh"];
            let exec: any = null;
            let lastError: any = null;

            for (const shell of tryShells) {
                try {
                    exec = await container.exec({
                        AttachStdin: true,
                        AttachStdout: true,
                        AttachStderr: true,
                        Tty: true,
                        Cmd: [shell],
                    });

                    const testStream = await exec.start({ stdin: true, hijack: true });

                    // Set initial sensible size
                    try {
                        await exec.resize({ h: 24, w: 80 });
                    } catch (e) {
                        logger.warn(`Initial resize failed: ${e}`);
                    }

                    this.bridgeStream(ws, testStream, exec, containerId);
                    return; // Success!
                } catch (error: any) {
                    lastError = error;
                    logger.warn(`Failed to start shell ${shell} for ${containerId}: ${error.message}`);
                    continue;
                }
            }

            throw new Error(`Could not find a valid shell. Last error: ${lastError?.message}`);

        } catch (error: any) {
            logger.error(error, `Failed to establish terminal session for container ${containerId}:`);
            ws.send(`\r\n\x1b[31m[Error] Failed to connect to terminal: ${error.message}\x1b[0m\r\n`);
            ws.close();
        }
    }

    private static bridgeStream(ws: WebSocket, stream: any, exec: any, containerId: string) {
        logger.info(`Bridging stream for container: ${containerId}`);

        // From browser to container
        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === "resize") {
                    logger.info(`Resizing terminal for ${containerId}: ${msg.cols}x${msg.rows}`);
                    exec.resize({ h: msg.rows, w: msg.cols }, (err: any) => {
                        if (err) logger.error(err, `Resize failed for ${containerId}:`);
                    });
                } else if (msg.type === "data") {
                    stream.write(msg.data);
                }
            } catch (e) {
                stream.write(data.toString());
            }
        });

        // From container to browser
        stream.on("data", (chunk: Buffer) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(chunk);
            }
        });

        // Handle disconnection
        ws.on("close", () => {
            logger.info(`WebSocket closed for container: ${containerId}`);
            stream.end();
            if (stream.destroy) stream.destroy();
        });

        stream.on("end", () => {
            logger.info(`Docker stream ended for container: ${containerId}`);
            if (ws.readyState === WebSocket.OPEN) ws.close(1000, "Docker stream ended");
        });

        stream.on("error", (err: any) => {
            logger.error(err, `Stream error for container ${containerId}:`);
            if (ws.readyState === WebSocket.OPEN) ws.close(1011, "Stream error");
        });
    }
}
