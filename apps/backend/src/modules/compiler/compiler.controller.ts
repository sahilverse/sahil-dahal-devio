import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CompilerService } from "./compiler.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class CompilerController {
    constructor(@inject(TYPES.CompilerService) private compilerService: CompilerService) { }

    getLanguages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const languages = await this.compilerService.getLanguages();
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Languages fetched successfully", languages);
    });

    executeCode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const result = await this.compilerService.executeCode(payload);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Code execution completed", result);
    });

    sendInput = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.params.sessionId as string;
        const { input } = req.body;
        await this.compilerService.sendInput(sessionId, input);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Input sent successfully");
    });

    endSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.params.sessionId as string;
        await this.compilerService.endSession(sessionId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Session ended successfully");
    });
}
