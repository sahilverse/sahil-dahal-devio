import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { ModuleService } from "./module.service";
import { asyncHandler, ResponseHandler } from "../../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class ModuleController {
    constructor(@inject(TYPES.ModuleService) private moduleService: ModuleService) { }

    createModule = asyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params as { courseId: string };
        const result = await this.moduleService.createModule(courseId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Module created successfully", result);
    });

    updateModule = asyncHandler(async (req: Request, res: Response) => {
        const { moduleId } = req.params as { moduleId: string };
        const result = await this.moduleService.updateModule(moduleId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Module updated successfully", result);
    });

    deleteModule = asyncHandler(async (req: Request, res: Response) => {
        const { moduleId } = req.params as { moduleId: string };
        await this.moduleService.deleteModule(moduleId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Module deleted successfully");
    });

    getModules = asyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params as { courseId: string };
        const query = req.query as any;
        const result = await this.moduleService.getModulesByCourseId(courseId, query);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Modules fetched successfully", result);
    });
}
