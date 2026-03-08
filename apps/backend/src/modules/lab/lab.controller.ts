import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { LabService } from "./lab.service";

@injectable()
export class LabController {
    constructor(
        @inject(TYPES.LabService) private labService: LabService
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
}
