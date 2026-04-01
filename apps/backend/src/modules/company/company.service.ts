import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CompanyRepository } from "./company.repository";
import { UserRepository } from "../user/user.repository";
import type { CompanySearchResponse } from "./company.types";
import { CompanyRole, NotificationType } from "../../generated/prisma/client";
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto } from "./company.dto";
import { ApiError, logger } from "../../utils";
import { StatusCodes } from "http-status-codes";
import slugify from "slugify";
import { StorageService } from "../storage/storage.service";
import { NotificationService } from "../notification";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

@injectable()
export class CompanyService {
    constructor(
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.StorageService) private storageService: StorageService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
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

    async getCompanyById(id: string): Promise<CompanyResponseDto> {
        const company = await this.companyRepository.findById(id);
        if (!company) throw new ApiError("Company not found", StatusCodes.NOT_FOUND);
        return company;
    }

    async getCompanyBySlug(slug: string, userId?: string): Promise<CompanyResponseDto> {
        const company = await this.companyRepository.findBySlug(slug);
        if (!company) throw new ApiError("Company not found", StatusCodes.NOT_FOUND);

        let userRole: CompanyRole | null = null;
        if (userId) {
            if (company.ownerId === userId) {
                userRole = "OWNER";
            } else {
                const member = await this.companyRepository.findMember(company.id, userId);
                if (member) userRole = member.role;
            }
        }

        return { ...company, userRole };
    }

    async updateCompany(companyId: string, userId: string, data: any): Promise<CompanyResponseDto> {
        const company = await this.getCompanyById(companyId);

        // Check permissions (Owner only for now)
        if (company.ownerId !== userId) {
            throw new ApiError("You do not have permission to update this company", StatusCodes.FORBIDDEN);
        }

        return this.companyRepository.update(companyId, data);
    }

    async manageMember(companyId: string, adminId: string, payload: { userId?: string, identifier?: string, action: "ADD" | "REMOVE" | "UPDATE_ROLE", role?: CompanyRole }) {
        const { userId: targetUserId, identifier, action, role } = payload;
        const company = await this.getCompanyById(companyId);

        // Check if admin is OWNER
        if (company.ownerId !== adminId) {
            const member = await this.companyRepository.findMember(companyId, adminId);
            if (!member || member.role !== "OWNER") {
                throw new ApiError("Only owners can manage members", StatusCodes.FORBIDDEN);
            }
        }

        if (action === "ADD") {
            let finalUserId = targetUserId;

            if (!finalUserId && identifier) {
                // Strip u/ if present
                const username = identifier.startsWith("u/") ? identifier.slice(2) : identifier;
                const user = await this.userRepository.findByUsername(username);
                if (!user) throw new ApiError(`User u/${username} not found`, StatusCodes.NOT_FOUND);
                finalUserId = user.id;
            }

            if (!finalUserId) throw new ApiError("User ID or identifier required for ADD action", StatusCodes.BAD_REQUEST);

            // Check if already a member
            const existing = await this.companyRepository.findMember(companyId, finalUserId);
            if (existing || company.ownerId === finalUserId) {
                throw new ApiError("User is already a member of this company", StatusCodes.CONFLICT);
            }

            const result = await this.companyRepository.addMember(companyId, finalUserId, role!);

            // Send real-time notification to the added user
            try {
                await this.notificationService.notify({
                    userId: finalUserId,
                    type: NotificationType.SYSTEM,
                    actorId: adminId,
                    message: `You have been added as a ${role!.toLowerCase()} in c/${company.slug}`,
                    actionUrl: `/c/${company.slug}`,
                });
            } catch (err) {
                logger.error(err as Error, `Failed to send notification for member addition to company ${companyId}`);
            }

            return result;
        } else if (action === "REMOVE") {
            if (!targetUserId) throw new ApiError("User ID required for REMOVE action", StatusCodes.BAD_REQUEST);
            if (targetUserId === company.ownerId) {
                throw new ApiError("Cannot remove the owner", StatusCodes.BAD_REQUEST);
            }
            return this.companyRepository.removeMember(companyId, targetUserId);
        } else if (action === "UPDATE_ROLE") {
            if (!targetUserId) throw new ApiError("User ID required for UPDATE_ROLE action", StatusCodes.BAD_REQUEST);
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
