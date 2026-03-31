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
function probeVideo(inputPath: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(err);

            const videoStream = metadata.streams.find((s) => s.codec_type === "video");
            if (!videoStream || !videoStream.width || !videoStream.height) {
                return reject(new Error("Could not determine video resolution"));
            }

            resolve({ width: videoStream.width, height: videoStream.height });
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
 * Generates the master HLS playlist that references all variant playlists.
 */
function generateMasterPlaylist(outputDir: string, variants: VideoVariant[]): void {
    let content = "#EXTM3U\n#EXT-X-VERSION:3\n\n";

    for (const variant of variants) {
        const bandwidth = parseInt(variant.videoBitrate) * 1000;
        content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${variant.width}x${variant.height}\n`;
        content += `${variant.name}/playlist.m3u8\n\n`;
    }

    const masterPath = path.join(outputDir, "master.m3u8");
    fs.writeFileSync(masterPath, content);
    logger.info(`Master playlist generated: ${masterPath}`);
}

/**
 * Main processing function: probes video, transcodes applicable variants,
 * and generates a master playlist.
 */
export async function processVideo(inputPath: string, outputDir: string): Promise<string[]> {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    logger.info(`Probing video: ${inputPath}`);
    const { width, height } = await probeVideo(inputPath);
    logger.info(`Source resolution: ${width}x${height}`);

    // Filter variants to only include those <= source resolution
    const applicableVariants = VARIANTS.filter((v) => v.height <= height);

    if (applicableVariants.length === 0) {
        // If source is smaller than 360p, still transcode to 360p
        applicableVariants.push(VARIANTS[0]!);
    }

    logger.info(`Transcoding ${applicableVariants.length} variants: ${applicableVariants.map((v) => v.name).join(", ")}`);

    // Transcode all applicable variants sequentially to avoid overloading CPU
    for (const variant of applicableVariants) {
        await transcodeVariant(inputPath, outputDir, variant);
    }

    generateMasterPlaylist(outputDir, applicableVariants);

    return applicableVariants.map((v) => v.name);
}
