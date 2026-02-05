import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError("Invalid file type. Only JPEG, PNG, and WebP are allowed.", StatusCodes.BAD_REQUEST) as any);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max overall
    },
});
