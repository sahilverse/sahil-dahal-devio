import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError("Invalid file type. Only JPEG, PNG, and WebP are allowed.", StatusCodes.BAD_REQUEST));
    }
};

const videoFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError("Invalid file type. Only MP4, MOV, AVI, and WebM are allowed.", StatusCodes.BAD_REQUEST));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max overall
    },
});

export const videoUpload = multer({
    storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max for videos
    },
});
