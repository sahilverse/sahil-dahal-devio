import { injectable } from "inversify";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ObjectCannedACL, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME, MINIO_BUCKET_PROBLEMS } from "../../config/constants";
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
        const buckets = [MINIO_BUCKET_NAME, MINIO_BUCKET_PROBLEMS];

        for (const bucket of buckets) {
            try {

                await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
                logger.debug(`Bucket "${bucket}" already exists.`);
            } catch (error: any) {
                if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
                    logger.info(`Creating bucket "${bucket}"...`);
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));

                    // Set Public Read Policy
                    const policy = {
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Sid: "PublicRead",
                                Effect: "Allow",
                                Principal: "*",
                                Action: ["s3:GetObject"],
                                Resource: [`arn:aws:s3:::${bucket}/*`],
                            },
                        ],
                    };

                    await this.s3Client.send(new PutBucketPolicyCommand({
                        Bucket: bucket,
                        Policy: JSON.stringify(policy),
                    }));

                    logger.info(`Bucket "${bucket}" created and policy set to public.`);
                } else {
                    logger.error(`Error checking/creating bucket "${bucket}": ${error.message}`);
                }
            }
        }
    }

    async uploadFile(file: Express.Multer.File, path: string, bucketName: string = MINIO_BUCKET_NAME): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: path,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read" as ObjectCannedACL,
            });

            await this.s3Client.send(command);
            return `${MINIO_ENDPOINT}/${bucketName}/${path}`;
        } catch (error: any) {
            logger.error(`Failed to upload file to MinIO: ${error.message}`);
            throw new ApiError(`Failed to upload file: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFile(path: string, bucketName: string = MINIO_BUCKET_NAME): Promise<void> {
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
