import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { asyncHandler } from "../../utils/asyncHandler";
import { ResponseHandler } from "../../utils/response";
import { StatusCodes } from "http-status-codes";
import { TYPES } from "../../types";
import { CompanyService } from "./company.service";

@injectable()
export class CompanyController {
    constructor(
        @inject(TYPES.CompanyService) private companyService: CompanyService
    ) { }

    searchCompanies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { q } = req.query as { q: string };
        const companies = await this.companyService.searchCompanies(q || "");
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Companies fetched successfully", companies);
    });
}
