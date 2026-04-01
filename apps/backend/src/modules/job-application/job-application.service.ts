import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { JobApplicationRepository } from "./job-application.repository";
import { JobRepository } from "../job/job.repository";
import { CompanyRepository } from "../company/company.repository";
import { CreateJobApplicationDto, JobApplicationResponseDto, PaginatedJobApplicationResponseDto } from "./job-application.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { ApplicationStatus } from "../../generated/prisma/client";

@injectable()
export class JobApplicationService {
    constructor(
        @inject(TYPES.JobApplicationRepository) private jobApplicationRepository: JobApplicationRepository,
        @inject(TYPES.JobRepository) private jobRepository: JobRepository,
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository
    ) { }

    async applyForJob(userId: string, data: CreateJobApplicationDto): Promise<JobApplicationResponseDto> {
        const { jobId, coverLetter, resumeUrl } = data;

        // 1. Check if job exists and get author/company info
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        // 2. Permission Check: Job Author cannot apply
        if (job.authorId === userId) {
            throw new ApiError("You cannot apply to your own job posting", StatusCodes.FORBIDDEN);
        }

        // 3. Permission Check: Company Owner/Recruiter cannot apply
        const companyId = job.companyId;
        if (companyId && job.company) {
            if (job.company.ownerId === userId) {
                throw new ApiError("As the company owner, you cannot apply to this job", StatusCodes.FORBIDDEN);
            }

            const member = await this.companyRepository.findMember(companyId, userId);
            if (member && (member.role === "OWNER" || member.role === "RECRUITER")) {
                throw new ApiError("Recruiters cannot apply to their company's jobs", StatusCodes.FORBIDDEN);
            }
        }

        // 4. Prevent duplicate applications
        const existing = await this.jobApplicationRepository.findByJobAndUser(jobId, userId);
        if (existing) {
            throw new ApiError("You have already applied for this position", StatusCodes.CONFLICT);
        }

        // 5. Create application
        return this.jobApplicationRepository.create({
            job: { connect: { id: jobId } },
            user: { connect: { id: userId } },
            coverLetter,
            resumeUrl,
            status: "PENDING"
        });
    }

    async getApplicationsForJob(jobId: string, userId: string, cursor?: string, limit: number = 10): Promise<PaginatedJobApplicationResponseDto> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        // RBAC: Only Author or Company Admin can view applications
        const isAuthor = job.authorId === userId;
        const member = await this.companyRepository.findMember(job.companyId, userId);
        const isCompanyAdmin = job.company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthor && !isCompanyAdmin) {
            throw new ApiError("You do not have permission to view applications for this job", StatusCodes.FORBIDDEN);
        }

        const applications = await this.jobApplicationRepository.findByJobId(jobId, limit + 1, cursor);
        const hasNextPage = applications.length > limit;
        const resultApplications = hasNextPage ? applications.slice(0, limit) : applications;
        const nextCursor = hasNextPage ? resultApplications[resultApplications.length - 1]?.id || null : null;

        return {
            applications: resultApplications as any,
            nextCursor
        };
    }

    async getUserApplications(userId: string, cursor?: string, limit: number = 10): Promise<PaginatedJobApplicationResponseDto> {
        const applications = await this.jobApplicationRepository.findByUserId(userId, limit + 1, cursor);
        const hasNextPage = applications.length > limit;
        const resultApplications = hasNextPage ? applications.slice(0, limit) : applications;
        const nextCursor = hasNextPage ? resultApplications[resultApplications.length - 1]?.id || null : null;

        return {
            applications: resultApplications as any,
            nextCursor
        };
    }

    async hasUserApplied(jobId: string, userId: string): Promise<boolean> {
        const existing = await this.jobApplicationRepository.findByJobAndUser(jobId, userId);
        return !!existing;
    }

    async updateApplicationStatus(applicationId: string, status: ApplicationStatus, userId: string): Promise<JobApplicationResponseDto> {
        const application = await this.jobApplicationRepository.findById(applicationId);
        if (!application) throw new ApiError("Application not found", StatusCodes.NOT_FOUND);

        const job = await this.jobRepository.findById(application.jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        // RBAC: Only Author or Company Admin can edit application statuses
        const isAuthor = job.authorId === userId;
        const member = await this.companyRepository.findMember(job.companyId, userId);
        const isCompanyAdmin = job.company?.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthor && !isCompanyAdmin) {
            throw new ApiError("You do not have permission to update this application", StatusCodes.FORBIDDEN);
        }

        return this.jobApplicationRepository.update(applicationId, { status }) as any;
    }
}
