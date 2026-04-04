export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const REDIS_URL = process.env.REDIS_URL!;

// MinIO / S3
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER!;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD!;
export const MINIO_BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS!;
export const S3_REGION = process.env.S3_REGION || "ap-south-1";

// FFmpeg
export const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
export const DISABLE_GPU = process.env.DISABLE_GPU === "true";

// Queue
export const VIDEO_TRANSCODE_QUEUE = "video-transcode";
export const VIDEO_TRANSCODE_JOB = "transcode-video";
