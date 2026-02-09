import Docker from 'dockerode';
import { LANGUAGE_CONFIG } from '../config/languages';
import { logger } from '../utils/logger';
import DockerPool from './DockerPool';

export interface StreamData {
    stdout: string;
    stderr: string;
    stream?: any;
    dataReceived?: boolean;
    resolveDataWait?: () => void;
}

export class ExecutionService {
    constructor(private pool: DockerPool) { }

    async executeCode(
        container: Docker.Container,
        code: string,
        language: string,
        sessionId: string,
        streamData: StreamData
    ): Promise<void> {
        const config = LANGUAGE_CONFIG[language];
        if (!config) throw new Error(`Unsupported language: ${language}`);

        let filename = `main${config.extension}`;
        if (language === 'java') {
            const className = this.extractJavaClassName(code);
            filename = `${className}${config.extension}`;
        }

        try {
            await this.writeFileToContainer(container, filename, code);
            await this.executeCodeInternal(sessionId, container, config, filename, code, streamData, language);
        } catch (error: any) {
            logger.error(`Error executing code in session ${sessionId}: ${error.message}`);
            throw error;
        }
    }

    async sendInput(stream: any, input: string): Promise<void> {
        if (!stream) {
            throw new Error('No active stream');
        }
        stream.write(input + '\n');
    }

    private async executeCodeInternal(
        sessionId: string,
        container: Docker.Container,
        config: any,
        filename: string,
        code: string,
        streamData: StreamData,
        language: string
    ): Promise<void> {

        try {
            let execCmd: string[] = [];

            if (language === 'java') {
                const className = this.extractJavaClassName(code);
                execCmd = ['bash', '-c', `stty -echo; javac ${className}.java && java ${className}`];
            } else if (config.compileCommand) {
                const compileCmd = config.compileCommand.map((cmd: string) => cmd.replace('{filename}', filename)).join(' ');
                const runCmd = config.runCommand.map((cmd: string) => cmd.replace('{filename}', filename)).join(' ');
                execCmd = ['bash', '-c', `stty -echo; ${compileCmd} && ${runCmd}`];
            } else {
                const cmd = config.runCommand.map((cmd: string) => cmd.replace('{filename}', filename)).join(' ');
                execCmd = ['bash', '-c', `stty -echo; ${cmd}`];
            }

            const exec = await container.exec({
                Cmd: execCmd,
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                User: 'sandboxuser',
                WorkingDir: '/home/sandboxuser/tmp',
                Tty: true
            });

            // Set execution timeout (kill process after config.timeout seconds)
            const timeoutMs = (config.timeout || 15) * 1000;
            const timeoutTimer = setTimeout(async () => {
                logger.warn(`Session ${sessionId} execution timed out after ${timeoutMs}ms`);
                try {
                    await container.exec({
                        Cmd: ['pkill', '-9', '-u', 'sandboxuser'],
                        User: 'root'
                    }).then(e => e.start({}));

                    streamData.stderr += `\n[Execution timed out after ${config.timeout}s]\n`;
                    if (streamData.resolveDataWait) streamData.resolveDataWait();
                } catch (err) {
                    logger.error(`Failed to kill process for session ${sessionId}: ${err}`);
                }
            }, timeoutMs);

            exec.start({ hijack: true, stdin: true }, (err: any, stream: any) => {
                if (err) {
                    clearTimeout(timeoutTimer);
                    logger.error(`Exec start error for session ${sessionId}: ${err.message}`);
                    return;
                }

                streamData.stream = stream;
                let outputSize = 0;
                const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB

                stream.on('data', (chunk: Buffer) => {
                    const output = this.demuxStream(chunk);

                    // Check output size limit
                    outputSize += output.stdout.length + output.stderr.length;
                    if (outputSize > MAX_OUTPUT_SIZE) {
                        if (!streamData.stderr.includes('[Output truncated]')) {
                            streamData.stderr += '\n[Output truncated - exceeded 1MB limit]\n';
                        }
                        return;
                    }

                    streamData.stdout += this.cleanupFilePath(output.stdout);
                    streamData.stderr += output.stderr;
                    streamData.dataReceived = true;
                    logger.debug(`Session ${sessionId} output: ${output.stdout}${output.stderr}`);

                    if (streamData.resolveDataWait) {
                        streamData.resolveDataWait();
                    }
                });

                stream.on('end', () => {
                    clearTimeout(timeoutTimer);
                    logger.debug(`Session ${sessionId} stream ended`);
                    if (streamData.resolveDataWait) streamData.resolveDataWait();
                });

                stream.on('error', (error: any) => {
                    clearTimeout(timeoutTimer);
                    logger.error(`Session ${sessionId} stream error: ${error.message}`);
                });
            });

        } catch (error: any) {
            logger.error(`Error executing code: ${error.message}`);
            throw error;
        }
    }

    private async writeFileToContainer(container: Docker.Container, filename: string, content: string): Promise<void> {
        const escapedContent = content.replace(/'/g, `'"'"'`);
        const exec = await container.exec({
            Cmd: ['sh', '-c', `printf '%s\\n' '${escapedContent}' > ${filename}`],
            User: 'sandboxuser',
            WorkingDir: '/home/sandboxuser/tmp'
        });

        await new Promise<void>((resolve, reject) => {
            let resolved = false;
            const timeoutHandle = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            }, 500);

            exec.start({}, (err: any, stream: any) => {
                if (err) {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeoutHandle);
                        reject(err);
                    }
                    return;
                }

                const handleCompletion = () => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timeoutHandle);
                    resolve();
                };

                stream?.on('end', handleCompletion);
                stream?.on('close', handleCompletion);
                stream?.on('data', () => { });

                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeoutHandle);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    private extractJavaClassName(code: string): string {
        const publicClassMatch = code.match(/public\s+class\s+(\w+)/);
        const classMatch = code.match(/class\s+(\w+)/);
        const name = publicClassMatch?.[1] ?? classMatch?.[1] ?? 'Main';
        return name;
    }

    private demuxStream(chunk: Buffer): { stdout: string; stderr: string } {
        let stdout = '';
        let stderr = '';
        let offset = 0;

        while (offset < chunk.length) {
            if (offset + 8 > chunk.length) break;

            const streamType = chunk[offset];
            const size = chunk.readUInt32BE(offset + 4);

            if (offset + 8 + size > chunk.length) break;

            let data = chunk.slice(offset + 8, offset + 8 + size).toString();
            data = data.replace(/\r/g, '');
            data = this.stripAnsiCodes(data);

            if (streamType === 1) {
                stdout += data;
            } else if (streamType === 2) {
                stderr += data;
            }

            offset += 8 + size;
        }

        return { stdout, stderr };
    }

    private stripAnsiCodes(text: string): string {
        return text.replace(/\x1b\[[0-9;]*[mGKHfABCDsuJ]/g, '');
    }

    private cleanupFilePath(text: string): string {
        return text.replace(/\/home\/sandboxuser\/tmp\//g, '');
    }

}
