import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { DISABLE_GPU, FFMPEG_PATH } from "./config/constants";
import { logger } from "./utils/logger";

const execAsync = promisify(exec);
let cachedEncoder: string | null = null;

ffmpeg.setFfmpegPath(FFMPEG_PATH);

interface VideoVariant {
    name: string;
    width: number;
    height: number;
    videoBitrate: string;
    audioBitrate: string;
    maxrate: string;
    bufsize: string;
}

const VARIANTS: VideoVariant[] = [
    { name: "360p", width: 640, height: 360, videoBitrate: "800k", audioBitrate: "96k", maxrate: "856k", bufsize: "1200k" },
    { name: "480p", width: 854, height: 480, videoBitrate: "1400k", audioBitrate: "128k", maxrate: "1498k", bufsize: "2100k" },
    { name: "720p", width: 1280, height: 720, videoBitrate: "2800k", audioBitrate: "128k", maxrate: "2996k", bufsize: "4200k" },
    { name: "1080p", width: 1920, height: 1080, videoBitrate: "5000k", audioBitrate: "192k", maxrate: "5350k", bufsize: "7500k" },
];

/**
 * Detects if the system supports NVIDIA hardware acceleration (h264_nvenc).
 * Verification includes both FFmpeg capability AND hardware device presence.
 */
async function getBestEncoder(): Promise<string> {
    if (DISABLE_GPU) {
        logger.info("Manual Override: GPU disabled via environment variable. Using CPU (libx264).");
        return "libx264";
    }

    if (cachedEncoder) return cachedEncoder;

    try {
        const { stdout } = await execAsync(`${FFMPEG_PATH} -encoders`);
        const hasEncoder = stdout.includes("h264_nvenc");
        const hasDevice = fs.existsSync("/dev/nvidia0");

        if (hasEncoder && hasDevice) {
            logger.info("Auto-detection: NVIDIA GPU (h264_nvenc) supported.");
            cachedEncoder = "h264_nvenc";
        } else {
            if (hasEncoder && !hasDevice) {
                logger.warn("Auto-detection: h264_nvenc is available in FFmpeg but /dev/nvidia0 was not found. GPU likely not passed to container.");
            }
            logger.info("Auto-detection: Falling back to CPU (libx264).");
            cachedEncoder = "libx264";
        }
    } catch (error) {
        logger.warn("Auto-detection failed, defaulting to CPU (libx264).");
        cachedEncoder = "libx264";
    }

    return cachedEncoder;
}

/**
 * Probes the input video to determine its resolution.
 * Returns the list of applicable variants (only those <= source resolution).
 */
function probeVideo(inputPath: string): Promise<{ width: number; height: number; duration: number }> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(err);

            const videoStream = metadata.streams.find((s) => s.codec_type === "video");
            const duration = metadata.format.duration;

            if (!videoStream || !videoStream.width || !videoStream.height || duration === undefined) {
                return reject(new Error("Could not determine video metadata"));
            }

            resolve({ width: videoStream.width, height: videoStream.height, duration });
        });
    });
}

/**
 * Transcodes a single variant using FFmpeg (Software CPU).
 */
function transcodeVariant(inputPath: string, outputDir: string, variant: VideoVariant): Promise<void> {
    const variantDir = path.join(outputDir, variant.name);
    if (!fs.existsSync(variantDir)) {
        fs.mkdirSync(variantDir, { recursive: true });
    }

    const playlistPath = path.join(variantDir, "playlist.m3u8");
    const segmentPattern = path.join(variantDir, "segment_%03d.ts");

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                "-vf", `scale=w=${variant.width}:h=${variant.height}:force_original_aspect_ratio=decrease,pad=${variant.width}:${variant.height}:(ow-iw)/2:(oh-ih)/2`,
                "-c:v", "libx264",
                "-b:v", variant.videoBitrate,
                "-maxrate", variant.maxrate,
                "-bufsize", variant.bufsize,
                "-c:a", "aac",
                "-b:a", variant.audioBitrate,
                "-ar", "48000",
                "-preset", "fast",
                "-g", "48",
                "-keyint_min", "48",
                "-sc_threshold", "0",
                "-hls_time", "6",
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", segmentPattern,
                "-f", "hls",
            ])
            .output(playlistPath)
            .on("start", (cmd) => {
                logger.debug(`FFmpeg [${variant.name}]: ${cmd}`);
            })
            .on("progress", (progress) => {
                if (progress.percent) {
                    logger.info(`[${variant.name}] Progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on("end", () => {
                logger.info(`[${variant.name}] Transcoding complete`);
                resolve();
            })
            .on("error", (err) => {
                logger.error(`[${variant.name}] FFmpeg error: ${err.message}`);
                reject(err);
            })
            .run();
    });
}

/**
 * Logic for sequential CPU transcoding of multiple variants.
 */
async function transcodeCPU(inputPath: string, outputDir: string, variants: VideoVariant[], duration: number): Promise<{ variants: string[]; duration: number }> {
    logger.info(`Starting sequential CPU transcode for ${variants.length} variants`);
    for (const variant of variants) {
        logger.info(`Transcoding variant: ${variant.name} (Software)`);
        await transcodeVariant(inputPath, outputDir, variant);
    }

    // Generate Master Playlist for CPU mode
    const masterPlaylistPath = path.join(outputDir, "master.m3u8");
    let masterContent = "#EXTM3U\n#EXT-X-VERSION:3\n";
    variants.forEach((v) => {
        const bandwidth = parseInt(v.videoBitrate.replace("k", "000"));
        masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${v.width}x${v.height}\n`;
        masterContent += `${v.name}/playlist.m3u8\n`;
    });
    fs.writeFileSync(masterPlaylistPath, masterContent);

    logger.info("Sequential transcode and master playlist generation complete");
    return { variants: variants.map((v) => v.name), duration };
}

/**
 * Main processing function: Executes NVIDIA GPU transcode with an automatic CPU fallback bridge.
 */
export async function processVideo(inputPath: string, outputDir: string): Promise<{ variants: string[]; duration: number }> {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    logger.info(`Probing video: ${inputPath}`);
    const { width, height, duration } = await probeVideo(inputPath);
    logger.info(`Source resolution: ${width}x${height} | Duration: ${duration}s`);

    // Filter variants to only include those <= source resolution
    let applicableVariants = VARIANTS.filter((v) => v.height <= height);
    if (applicableVariants.length === 0) {
        applicableVariants.push(VARIANTS[0]!);
    }

    const encoder = await getBestEncoder();

    if (encoder === "libx264") {
        return await transcodeCPU(inputPath, outputDir, applicableVariants, duration);
    }

    // --- NVIDIA Hardware path (Single-Pass) with Fallback ---
    logger.info(`Starting single-pass GPU transcode for ${applicableVariants.length} variants`);
    try {
        return await new Promise((resolve, reject) => {
            const command = ffmpeg(inputPath);

            // Split the decoded video into N streams
            let filterComplex = `[0:v]split=${applicableVariants.length}`;
            applicableVariants.forEach((_, i) => {
                filterComplex += `[v${i}]`;
            });
            filterComplex += ";";

            // Add scaling for each stream
            applicableVariants.forEach((v, i) => {
                filterComplex += `[v${i}]scale=w=${v.width}:h=${v.height}:force_original_aspect_ratio=decrease,pad=${v.width}:${v.height}:(ow-iw)/2:(oh-ih)/2[vout${i}]`;
                if (i < applicableVariants.length - 1) filterComplex += ";";
            });

            const outputOptions: string[] = ["-filter_complex", filterComplex];

            applicableVariants.forEach((v, i) => {
                outputOptions.push(
                    "-map", `[vout${i}]`,
                    `-c:v:${i}`, "h264_nvenc",
                    `-b:v:${i}`, v.videoBitrate,
                    `-maxrate:${i}`, v.maxrate,
                    `-bufsize:${i}`, v.bufsize,
                    "-preset", "p4",
                    "-g", "48",
                    "-keyint_min", "48",
                    "-sc_threshold", "0"
                );
            });

            applicableVariants.forEach((_, i) => {
                outputOptions.push(
                    "-map", "0:a",
                    `-c:a:${i}`, "aac",
                    `-b:a:${i}`, "128k",
                    `-ar:${i}`, "48000"
                );
            });

            const streamMap = applicableVariants.map((v, i) => `v:${i},a:${i},name:${v.name}`).join(" ");
            outputOptions.push(
                "-f", "hls",
                "-hls_time", "6",
                "-hls_playlist_type", "vod",
                "-master_pl_name", "master.m3u8",
                "-var_stream_map", streamMap,
                "-hls_segment_filename", path.join(outputDir, "%v", "segment_%03d.ts")
            );

            command
                .outputOptions(outputOptions)
                .output(path.join(outputDir, "%v", "playlist.m3u8"))
                .on("start", (cmd) => logger.debug(`FFmpeg command: ${cmd}`))
                .on("progress", (progress) => {
                    if (progress.percent) logger.info(`GPU Transcoding Progress: ${Math.round(progress.percent)}%`);
                })
                .on("end", () => {
                    logger.info(`GPU transcode complete for all variants`);
                    resolve({ variants: applicableVariants.map((v) => v.name), duration });
                })
                .on("error", (err) => {
                    reject(err);
                })
                .run();
        });
    } catch (gpuError: any) {
        logger.error(`Critical GPU transcode failure: ${gpuError.message}`);
        logger.warn("Automatic fallback initiated: Switching to CPU (Software) mode...");

        // Reset output directory to avoid partial GPU file conflicts
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
            fs.mkdirSync(outputDir, { recursive: true });
        }

        return await transcodeCPU(inputPath, outputDir, applicableVariants, duration);
    }
}
