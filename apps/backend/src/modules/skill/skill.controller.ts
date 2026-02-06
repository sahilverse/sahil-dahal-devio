import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SkillService } from "./skill.service";
import { asyncHandler, ResponseHandler } from "../../utils";
import { StatusCodes } from "http-status-codes";

@injectable()
export class SkillController {
    constructor(@inject(TYPES.SkillService) private skillService: SkillService) { }

    searchSkills = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { q } = req.query as { q: string };

        if (!q) {
            return ResponseHandler.sendResponse(res, StatusCodes.OK, "Skills fetched successfully", []);
        }

        const skills = await this.skillService.searchSkills(q);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Skills fetched successfully", skills);
    });

    createSkill = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.body;

        if (!name) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "Skill name is required");
        }

        const skill = await this.skillService.createSkill(name);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Skill created successfully", skill);
    });
}
