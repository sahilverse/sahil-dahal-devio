import { injectable } from "inversify";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ObjectCannedACL, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import {
    MINIO_ENDPOINT,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_BUCKET_UPLOADS,
    MINIO_BUCKET_PROBLEMS,
    MINIO_BUCKET_LABS,
    MINIO_BUCKET_VIDEOS
} from "../../config/constants";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../utils";

@injectable()
export class StorageService {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            endpoint: MINIO_ENDPOINT,
            region: "us-east-1",
            credentials: {
                accessKeyId: MINIO_ACCESS_KEY,
                secretAccessKey: MINIO_SECRET_KEY,
            },
            forcePathStyle: true,
        });
    }

    async init(): Promise<void> {
        const publicBuckets = [
            MINIO_BUCKET_UPLOADS,
            MINIO_BUCKET_PROBLEMS,
        ];
        const privateBuckets = [
            MINIO_BUCKET_LABS,
            MINIO_BUCKET_VIDEOS
        ];

        // Initialize Public Buckets
        for (const bucket of publicBuckets) {
            await this.ensureBucketExists(bucket, true);
        }

        // Initialize Private Buckets
        for (const bucket of privateBuckets) {
            await this.ensureBucketExists(bucket, false);
        }
    }

    private async ensureBucketExists(bucket: string, isPublic: boolean): Promise<void> {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
            logger.debug(`Bucket "${bucket}" already exists.`);
        } catch (error: any) {
            if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
                logger.info(`Creating bucket "${bucket}"...`);
                await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));

                if (isPublic) {
                    const policy = {
                        Version: "2012-10-17",
                        Statement: [{
                            Sid: "PublicRead",
                            Effect: "Allow",
                            Principal: "*",
                            Action: ["s3:GetObject"],
                            Resource: [`arn:aws:s3:::${bucket}/*`],
                        }],
                    };

                    await this.s3Client.send(new PutBucketPolicyCommand({
                        Bucket: bucket,
                        Policy: JSON.stringify(policy),
                    }));
                    logger.info(`Bucket "${bucket}" initialized with public-read policy.`);
                } else {
                    logger.info(`Bucket "${bucket}" initialized as PRIVATE.`);
                }
            } else {
                logger.error(`Storage initialization failed for "${bucket}": ${error.message}`);
                throw error;
            }
        }
    }

    async getFile(path: string, bucketName: string = MINIO_BUCKET_UPLOADS): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: path,
            });

            const response = await this.s3Client.send(command);
            const stream = response.Body as any;

            return new Promise((resolve, reject) => {
                const chunks: any[] = [];
                stream.on("data", (chunk: any) => chunks.push(chunk));
                stream.on("error", (err: any) => reject(err));
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });
        } catch (error: any) {
            logger.error(`Failed to get file from MinIO: ${error.message}`);
            throw new ApiError(`Failed to get file: ${error.message}`, StatusCodes.NOT_FOUND);
        }
    }

    async getObjectStream(path: string, bucketName: string = MINIO_BUCKET_UPLOADS) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: path,
            });

            const response = await this.s3Client.send(command);
            return {
                stream: response.Body as any,
                contentType: response.ContentType,
                contentLength: response.ContentLength,
            };
        } catch (error: any) {
            logger.error(`Failed to get object stream from MinIO: ${error.message}`);
            throw new ApiError(`Failed to get object: ${error.message}`, StatusCodes.NOT_FOUND);
        }
    }

    async uploadBuffer(buffer: Buffer, path: string, mimetype: string, bucketName: string = MINIO_BUCKET_UPLOADS, isPublic: boolean = true): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: path,
                Body: buffer,
                ContentType: mimetype,
                ACL: isPublic ? ("public-read" as ObjectCannedACL) : ("private" as ObjectCannedACL),
            });

            await this.s3Client.send(command);
            return `${MINIO_ENDPOINT}/${bucketName}/${path}`;
        } catch (error: any) {
            logger.error(`Failed to upload buffer to MinIO: ${error.message}`);
            throw new ApiError(`Failed to upload buffer: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFile(file: Express.Multer.File, path: string, bucketName: string = MINIO_BUCKET_UPLOADS, isPublic: boolean = true): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: path,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: isPublic ? ("public-read" as ObjectCannedACL) : ("private" as ObjectCannedACL),
            });

            await this.s3Client.send(command);
            return `${MINIO_ENDPOINT}/${bucketName}/${path}`;
        } catch (error: any) {
            logger.error(`Failed to upload file to MinIO: ${error.message}`);
            throw new ApiError(`Failed to upload file: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async listFiles(bucketName: string = MINIO_BUCKET_UPLOADS, prefix?: string): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
            });

            const response = await this.s3Client.send(command);
            return response.Contents?.map((obj) => obj.Key || "") || [];
        } catch (error: any) {
            logger.error(`Failed to list files from MinIO: ${error.message}`);
            return [];
        }
    }

    async deleteFile(path: string, bucketName: string = MINIO_BUCKET_UPLOADS): Promise<void> {
        try {
            const bucketPrefix = `${MINIO_ENDPOINT}/${bucketName}/`;
            const key = path.includes(bucketPrefix)
                ? path.replace(bucketPrefix, "")
                : path;

            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error: any) {
            logger.warn(`Failed to delete file from MinIO: ${error.message}`);
        }
    }
}
