import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_VIDEOS } from "./constants";
import { logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";

const s3Client = new S3Client({
    endpoint: MINIO_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

export async function downloadFile(key: string, destPath: string): Promise<void> {
    const command = new GetObjectCommand({
        Bucket: MINIO_BUCKET_VIDEOS,
        Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as NodeJS.ReadableStream;

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(destPath);
        stream.pipe(fileStream);
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
    });
}

export async function uploadFile(filePath: string, key: string, contentType: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
        Bucket: MINIO_BUCKET_VIDEOS,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });

    await s3Client.send(command);
    const url = `${MINIO_ENDPOINT}/${MINIO_BUCKET_VIDEOS}/${key}`;
    logger.debug(`Uploaded: ${url}`);
    return url;
}

export async function uploadDirectory(localDir: string, remotePrefix: string): Promise<void> {
    const files = getAllFiles(localDir);

    for (const filePath of files) {
        const relativePath = path.relative(localDir, filePath).replace(/\\/g, "/");
        const remoteKey = `${remotePrefix}/${relativePath}`;

        const ext = path.extname(filePath).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".m3u8") contentType = "application/vnd.apple.mpegurl";
        else if (ext === ".ts") contentType = "video/mp2t";

        await uploadFile(filePath, remoteKey, contentType);
    }
}

export async function deletePrefix(prefix: string): Promise<void> {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: MINIO_BUCKET_VIDEOS,
            Prefix: prefix,
        });

        const response = await s3Client.send(listCommand);
        const keys = response.Contents?.map((obj) => obj.Key).filter(Boolean) as string[];

        if (!keys || keys.length === 0) return;

        for (const key of keys) {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: MINIO_BUCKET_VIDEOS,
                Key: key,
            }));
        }

        logger.debug(`Deleted ${keys.length} files with prefix: ${prefix}`);
    } catch (error: any) {
        logger.warn(`Failed to delete prefix ${prefix}: ${error.message}`);
    }
}

function getAllFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getAllFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }

    return results;
}
