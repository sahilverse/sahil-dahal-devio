import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CompanyRepository } from "./company.repository";
import type { CompanySearchResponse } from "./company.types";
import { CompanyRole } from "../../generated/prisma/client";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import slugify from "slugify";
import { StorageService } from "../storage/storage.service";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

@injectable()
export class CompanyService {
    constructor(
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
    ) { }

    async searchCompanies(query: string): Promise<CompanySearchResponse[]> {
        return this.companyRepository.searchCompanies(query);
    }

    async createCompany(userId: string, data: { name: string; description?: string; websiteUrl?: string; location?: string; size?: string; logoUrl?: string }) {
        let slug = slugify(data.name, { lower: true, strict: true });

        // Check for slug collision
        const existing = await this.companyRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        const company = await this.companyRepository.create({
            ...data,
            slug,
            owner: { connect: { id: userId } }
        });

        // Add creator as OWNER
        await this.companyRepository.addMember(company.id, userId, "OWNER");

        return company;
    }

    async getCompanyById(id: string) {
        const company = await this.companyRepository.findById(id);
        if (!company) throw new ApiError("Company not found", StatusCodes.NOT_FOUND);
        return company;
    }

    async getCompanyBySlug(slug: string) {
        const company = await this.companyRepository.findBySlug(slug);
        if (!company) throw new ApiError("Company not found", StatusCodes.NOT_FOUND);
        return company;
    }

    async updateCompany(companyId: string, userId: string, data: any) {
        const company = await this.getCompanyById(companyId);

        // Check permissions (Owner only for now)
        if (company.ownerId !== userId) {
            throw new ApiError("You do not have permission to update this company", StatusCodes.FORBIDDEN);
        }

        return this.companyRepository.update(companyId, data);
    }

    async manageMember(companyId: string, adminId: string, targetUserId: string, action: "ADD" | "REMOVE" | "UPDATE_ROLE", role?: CompanyRole) {
        const company = await this.getCompanyById(companyId);

        // Check if admin is OWNER
        if (company.ownerId !== adminId) {
            const member = await this.companyRepository.findMember(companyId, adminId);
            if (!member || member.role !== "OWNER") {
                throw new ApiError("Only owners can manage members", StatusCodes.FORBIDDEN);
            }
        }

        if (action === "ADD") {
            return this.companyRepository.addMember(companyId, targetUserId, role || "MEMBER");
        } else if (action === "REMOVE") {
            if (targetUserId === company.ownerId) {
                throw new ApiError("Cannot remove the owner", StatusCodes.BAD_REQUEST);
            }
            return this.companyRepository.removeMember(companyId, targetUserId);
        } else if (action === "UPDATE_ROLE") {
            return this.companyRepository.updateMemberRole(companyId, targetUserId, role || "MEMBER");
        }
    }

    async verifyDomain(companyId: string, userId: string, email: string) {
        const company = await this.getCompanyById(companyId);

        // RBAC: Owner or Recruiter
        const member = await this.companyRepository.findMember(companyId, userId);
        const isAuthorized = company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthorized) {
            throw new ApiError("Not authorized to verify domain", StatusCodes.FORBIDDEN);
        }

        const domain = email.split("@")[1];
        if (!domain) throw new ApiError("Invalid email", StatusCodes.BAD_REQUEST);

        return this.companyRepository.update(companyId, {
            verificationTier: "DOMAIN_VERIFIED",
            verifiedDomain: domain,
            isVerified: true
        });
    }

    async getManagedCompanies(userId: string) {
        return this.companyRepository.findUserManagedCompanies(userId);
    }

    async uploadLogo(companyId: string, userId: string, file: Express.Multer.File): Promise<string> {
        const company = await this.getCompanyById(companyId);

        // Check permissions: Owner or Recruiter
        const member = await this.companyRepository.findMember(companyId, userId);
        const isAuthorized = company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthorized) {
            throw new ApiError("You do not have permission to update this company", StatusCodes.FORBIDDEN);
        }

        // Delete old logo if exists
        if (company.logoUrl) {
            await this.storageService.deleteFile(company.logoUrl);
        }

        const datePath = format(new Date(), "yyyy/MM/dd");
        const filename = `${uuidv4()}.webp`;
        const path = `companies/${datePath}/${filename}`;

        const logoUrl = await this.storageService.uploadFile(file, path);
        await this.companyRepository.update(companyId, { logoUrl });

        logger.info(`Company logo uploaded for company ${companyId} by user ${userId}`);
        return logoUrl;
    }

    async removeLogo(companyId: string, userId: string): Promise<void> {
        const company = await this.getCompanyById(companyId);

        const member = await this.companyRepository.findMember(companyId, userId);
        const isAuthorized = company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthorized) {
            throw new ApiError("You do not have permission to update this company", StatusCodes.FORBIDDEN);
        }

        if (company.logoUrl) {
            await this.storageService.deleteFile(company.logoUrl);
            await this.companyRepository.update(companyId, { logoUrl: null });
            logger.info(`Company logo removed for company ${companyId} by user ${userId}`);
        }
    }
}
