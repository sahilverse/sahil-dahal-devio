import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { LabService } from "./lab.service";
import { LabSyncService } from "./lab-sync.service";
import { logger } from "../../utils";

@injectable()
export class LabController {
    constructor(
        @inject(TYPES.LabService) private labService: LabService,
        @inject(TYPES.LabSyncService) private labSyncService: LabSyncService
    ) { }

    getRooms = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.labService.getRooms(req.query);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Rooms fetched successfully", result);
    });

    getRoomBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;
        const room = await this.labService.getRoomBySlug(slug as string);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Room fetched successfully", room);
    });

    joinRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.body;
        const enrollment = await this.labService.joinRoom(roomId, userId);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Joined room successfully", enrollment);
    });

    getEnrollment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.params;
        const enrollment = await this.labService.getEnrollment(roomId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Enrollment fetched successfully", enrollment);
    });

    getChallenges = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.params;
        const challenges = await this.labService.getRoomChallenges(roomId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Challenges fetched successfully", challenges);
    });

    submitFlag = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { challengeId } = req.params;
        const { answer, timezoneOffset } = req.body;
        const result = await this.labService.submitFlag(challengeId as string, userId, answer, timezoneOffset);
        ResponseHandler.sendResponse(res, StatusCodes.OK, result.message, result);
    });

    startSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.body;
        const session = await this.labService.startVMSession(userId, roomId);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "VM session started", session);
    });

    extendSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { sessionId } = req.params;
        const session = await this.labService.extendVMSession(sessionId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "VM session extended", session);
    });

    terminateSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { sessionId } = req.params;
        await this.labService.terminateVMSession(sessionId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "VM session terminated");
    });

    getActiveSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.params;
        const session = await this.labService.getActiveVMSession(userId, roomId as string);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Active session fetched", session);
    });

    handleMinioWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const eventName = payload.EventName || (payload.Records?.[0]?.eventName);

        if (payload.Event === 's3:TestEvent') {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Test event received");
        }

        if (!eventName?.startsWith('s3:ObjectCreated:')) {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Event ignored");
        }

        if (payload.Records && Array.isArray(payload.Records)) {
            for (const record of payload.Records) {
                const bucket = record.s3.bucket.name;
                const key = decodeURIComponent(record.s3.object.key);

                this.labSyncService.handleMinioEvent(bucket, key).catch((err: Error) => {
                    logger.error(`MinIO event bridge failed for room ${key}: ${err.message}`);
                });
            }
        }

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Processing triggered");
    });
}
