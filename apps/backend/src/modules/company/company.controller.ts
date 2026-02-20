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
        const { q } = req.query as { q?: string };
        const companies = await this.companyService.searchCompanies(q || "");
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Companies fetched successfully", companies);
    });

    createCompany = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const company = await this.companyService.createCompany(userId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.CREATED, "Company created successfully", company);
    });

    getCompanyBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params as { slug: string };
        const company = await this.companyService.getCompanyBySlug(slug);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Company fetched successfully", company);
    });

    updateCompany = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const company = await this.companyService.updateCompany(id, userId, req.body);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Company updated successfully", company);
    });

    manageMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const adminId = req.user!.id;
        const { id: companyId } = req.params as { id: string };
        const { userId: targetUserId, action, role } = req.body;
        const result = await this.companyService.manageMember(companyId, adminId, targetUserId, action, role);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Member managed successfully", result);
    });

    verifyDomain = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id: companyId } = req.params as { id: string };
        const { email } = req.body;
        const company = await this.companyService.verifyDomain(companyId, userId, email);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Domain verified successfully", company);
    });

    getManagedCompanies = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const companies = await this.companyService.getManagedCompanies(userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Managed companies fetched successfully", companies);
    });

    uploadLogo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const file = req.file;

        if (!file) {
            return ResponseHandler.sendError(res, StatusCodes.BAD_REQUEST, "No file uploaded");
        }

        const logoUrl = await this.companyService.uploadLogo(id, userId, file);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Company logo uploaded successfully", { logoUrl });
    });

    removeLogo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await this.companyService.removeLogo(id, userId);
        ResponseHandler.sendResponse(res, StatusCodes.OK, "Company logo removed successfully");
    });
}
