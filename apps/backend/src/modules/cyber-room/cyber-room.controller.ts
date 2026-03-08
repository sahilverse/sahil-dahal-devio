import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { CyberRoomService } from "./cyber-room.service";

@injectable()
export class CyberRoomController {
    constructor(
        @inject(TYPES.CyberRoomService) private cyberRoomService: CyberRoomService
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
        const session = await this.cyberRoomService.getActiveVMSession(roomId as string, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Active session fetched", session);
    });
}
