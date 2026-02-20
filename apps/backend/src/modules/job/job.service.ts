import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { JobRepository } from "./job.repository";
import { CompanyService } from "../company/company.service";
import { CompanyRepository } from "../company/company.repository";
import { TopicService } from "../topic/topic.service";
import { Job, Prisma } from "../../generated/prisma/client";
import { JobResponseDto, PaginatedJobsResponseDto } from "./job.dto";
import { ApiError } from "../../utils";
import { StatusCodes } from "http-status-codes";
import slugify from "slugify";

@injectable()
export class JobService {
    constructor(
        @inject(TYPES.JobRepository) private jobRepository: JobRepository,
        @inject(TYPES.CompanyService) private companyService: CompanyService,
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository,
        @inject(TYPES.TopicService) private topicService: TopicService
    ) { }

    async createJob(userId: string, data: any) {
        const { companyId, title, topics } = data;

        // 1. Get Company and verify tier
        const company = await this.companyService.getCompanyById(companyId);

        // BUSINESS RULE: Only Verified Companies (Tier 1 or 2) can post jobs
        if (company.verificationTier === "UNVERIFIED") {
            throw new ApiError("Only verified companies can post jobs. Please verify your company domain first.", StatusCodes.FORBIDDEN);
        }

        // 2. Check RBAC: Only OWNER or RECRUITER can post
        const member = await this.companyRepository.findMember(companyId, userId);
        const isAuthorized = company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthorized) {
            throw new ApiError("You do not have permission to post jobs for this company", StatusCodes.FORBIDDEN);
        }

        // 3. Resolve Topics 
        const topicIds: string[] = [];
        if (topics && Array.isArray(topics)) {
            for (const topicName of topics) {
                const topic = await this.topicService.createTopic(topicName);
                if (topic) topicIds.push(topic.id);
            }
        }

        // 4. Generate Slug
        let slug = slugify(title, { lower: true, strict: true });
        const existing = await this.jobRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // 5. Create Job with Topics
        return this.jobRepository.create({
            title: data.title,
            slug,
            description: data.description,
            type: data.type,
            workplace: data.workplace,
            location: data.location,
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            currency: data.currency || "NPR",
            applyLink: data.applyLink,
            company: { connect: { id: companyId } },
            author: { connect: { id: userId } },
            topics: {
                create: topicIds.map(id => ({
                    topic: { connect: { id } }
                }))
            }
        });
    }

    async getJobBySlug(slug: string): Promise<JobResponseDto> {
        const job = await this.jobRepository.findBySlug(slug);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);
        return job;
    }

    async getJobs(params: any): Promise<PaginatedJobsResponseDto> {
        return this.jobRepository.findAll(params);
    }

    async updateJob(jobId: string, userId: string, data: any) {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        // RBAC: Author or Company Admin
        const isAuthor = job.authorId === userId;
        const member = await this.companyRepository.findMember(job.companyId, userId);
        const isCompanyAdmin = job.company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthor && !isCompanyAdmin) {
            throw new ApiError("You do not have permission to update this job", StatusCodes.FORBIDDEN);
        }

        return this.jobRepository.update(jobId, data);
    }

    async deleteJob(jobId: string, userId: string) {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new ApiError("Job not found", StatusCodes.NOT_FOUND);

        const isAuthor = job.authorId === userId;
        const member = await this.companyRepository.findMember(job.companyId, userId);
        const isCompanyAdmin = job.company.ownerId === userId || (member && (member.role === "OWNER" || member.role === "RECRUITER"));

        if (!isAuthor && !isCompanyAdmin) {
            throw new ApiError("You do not have permission to delete this job", StatusCodes.FORBIDDEN);
        }

        return this.jobRepository.delete(jobId);
    }
}
