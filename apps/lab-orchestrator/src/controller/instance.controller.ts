import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DockerService } from '../services/DockerService';
import { ResponseHandler } from '../utils/ResponseHandler';
import { ApiError } from '../utils/ApiError';

export class InstanceController {
    constructor(private dockerService: DockerService) { }

    provision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { roomId, userId, imageId } = req.body;
            const result = await this.dockerService.provisionInstance(roomId, userId, imageId);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Machine provisioned successfully", result);
        } catch (error) {
            next(error);
        }
    };

    terminate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const instanceId = req.params.instanceId as string;
            if (!instanceId) throw new ApiError("Instance ID is required", StatusCodes.BAD_REQUEST);
            
            await this.dockerService.terminateInstance(instanceId);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Machine terminated successfully");
        } catch (error) {
            next(error);
        }
    };

    status = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const instanceId = req.params.instanceId as string;
            if (!instanceId) throw new ApiError("Instance ID is required", StatusCodes.BAD_REQUEST);
            
            const result = await this.dockerService.getInstanceStatus(instanceId);
            ResponseHandler.sendResponse(res, StatusCodes.OK, "Status retrieved successfully", result);
        } catch (error) {
            next(error);
        }
    };
}
