import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { CyberRoomService } from "./cyber-room.service";
import { CyberRoomSyncService } from "./cyber-room-sync.service";
import { logger } from "../../utils";

@injectable()
export class CyberRoomController {
    constructor(
        @inject(TYPES.CyberRoomService) private cyberRoomService: CyberRoomService,
        @inject(TYPES.CyberRoomSyncService) private cyberRoomSyncService: CyberRoomSyncService
    ) { }

    getChallenges = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.params;
        const challenges = await this.cyberRoomService.getRoomChallenges(roomId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Challenges fetched successfully", challenges);
    });

    submitFlag = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { challengeId } = req.params;
        const { answer } = req.body;
        const result = await this.cyberRoomService.submitFlag(challengeId as string, userId, answer);
        ResponseHandler.sendResponse(res, StatusCodes.OK, result.message, result);
    });

    startSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.body;
        const session = await this.cyberRoomService.startVMSession(userId, roomId);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "VM session started", session);
    });

    extendSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { sessionId } = req.params;
        const session = await this.cyberRoomService.extendVMSession(sessionId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "VM session extended", session);
    });

    terminateSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { sessionId } = req.params;
        await this.cyberRoomService.terminateVMSession(sessionId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "VM session terminated");
    });

    getActiveSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { roomId } = req.params;
        const session = await this.cyberRoomService.getActiveVMSession(userId, roomId as string);
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

                this.cyberRoomSyncService.handleMinioEvent(bucket, key).catch((err: Error) => {
                    logger.error(`MinIO event bridge failed for room ${key}: ${err.message}`);
                });
            }
        }

        return ResponseHandler.sendResponse(res, StatusCodes.OK, "Processing triggered");
    });
}
