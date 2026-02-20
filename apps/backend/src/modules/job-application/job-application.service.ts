import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { JobApplicationRepository } from "./job-application.repository";
import { JobRepository } from "../job/job.repository";
import { CompanyRepository } from "../company/company.repository";
import { CreateJobApplicationDto, JobApplicationResponseDto } from "./job-application.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";

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

    async getApplicationsForJob(jobId: string, userId: string): Promise<JobApplicationResponseDto[]> {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        // RBAC: Only Author or Company Admin can view applications
        const isAuthor = job.authorId === userId;
        const member = await this.companyRepository.findMember(job.companyId, userId);
        const isCompanyAdmin = job.company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthor && !isCompanyAdmin) {
            throw new ApiError("You do not have permission to view applications for this job", StatusCodes.FORBIDDEN);
        }

        return this.jobApplicationRepository.findByJobId(jobId);
    }

    async getUserApplications(userId: string): Promise<JobApplicationResponseDto[]> {
        return this.jobApplicationRepository.findByUserId(userId);
    }
}
