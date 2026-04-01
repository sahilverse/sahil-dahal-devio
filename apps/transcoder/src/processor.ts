import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import { FFMPEG_PATH } from "./config/constants";
import { logger } from "./utils/logger";

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
 * Transcodes a single variant using FFmpeg.
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
 * Main processing function: executes a single, high-performance NVIDIA-accelerated
 * FFmpeg command to generate all HLS variants and the master playlist in one pass.
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

    logger.info(`Starting transcode for ${applicableVariants.length} variants in a single pass`);

    return new Promise((resolve, reject) => {
        const command = ffmpeg(inputPath);

        // --- Build Filter Graph ---
        // Split the decoded video into N streams, one for each variant
        let filterComplex = `[0:v]split=${applicableVariants.length}`;
        applicableVariants.forEach((_, i) => {
            filterComplex += `[v${i}]`;
        });
        filterComplex += ";";

        // Add scaling for each split stream
        applicableVariants.forEach((v, i) => {
            // Using software scale for maximum compatibility, but nvenc for encoding
            filterComplex += `[v${i}]scale=w=${v.width}:h=${v.height}:force_original_aspect_ratio=decrease,pad=${v.width}:${v.height}:(ow-iw)/2:(oh-ih)/2[vout${i}]`;
            if (i < applicableVariants.length - 1) filterComplex += ";";
        });

        // --- Build Output Options ---
        const outputOptions: string[] = ["-filter_complex", filterComplex];

        // Map video streams, encoders, and bitrates
        applicableVariants.forEach((v, i) => {
            outputOptions.push(
                "-map", `[vout${i}]`,
                `-c:v:${i}`, "h264_nvenc", // NVIDIA Hardware Acceleration
                `-b:v:${i}`, v.videoBitrate,
                `-maxrate:${i}`, v.maxrate,
                `-bufsize:${i}`, v.bufsize,
                "-preset", "p4", // Faster preset for NVENC
                "-g", "48",
                "-keyint_min", "48",
                "-sc_threshold", "0"
            );
        });

        // Map audio streams (reuse first audio stream for all variants)
        applicableVariants.forEach((_, i) => {
            outputOptions.push(
                "-map", "0:a",
                `-c:a:${i}`, "aac",
                `-b:a:${i}`, "128k",
                `-ar:${i}`, "48000"
            );
        });

        // --- HLS Multi-Stream Mapping ---
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
            .on("start", (cmd) => {
                logger.debug(`FFmpeg command: ${cmd}`);
            })
            .on("progress", (progress) => {
                if (progress.percent) {
                    logger.info(`Transcoding Progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on("end", () => {
                logger.info(`Transcode complete for all variants`);
                resolve({ variants: applicableVariants.map((v) => v.name), duration });
            })
            .on("error", (err) => {
                logger.error(`Hardware transcode failed: ${err.message}. Ensure your NVIDIA GPU is accessible and drivers are up to date.`);
                reject(err);
            })
            .run();
    });
}
