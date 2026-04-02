import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { UserRepository } from "../user/user.repository";
import { TopicRepository } from "../topic/topic.repository";
import { JobRepository } from "../job/job.repository";
import { ProblemRepository } from "../problem/problem.repository";
import { CompanyRepository } from "../company/company.repository";
import { CommunityRepository } from "../community/community.repository";
import { CourseRepository } from "../course/course.repository";
import { SearchResultDTO, SearchResultType } from "./search.dto";

@injectable()
export class SearchService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.TopicRepository) private topicRepository: TopicRepository,
        @inject(TYPES.JobRepository) private jobRepository: JobRepository,
        @inject(TYPES.ProblemRepository) private problemRepository: ProblemRepository,
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository,
        @inject(TYPES.CommunityRepository) private communityRepository: CommunityRepository,
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository
    ) { }

    async globalSearch(query: string, limit: number = 6) {
        const trimmedQuery = query.trim();
        const prefix = this.extractPrefix(trimmedQuery);
        const actualQuery = prefix ? trimmedQuery.slice(2).trim() : trimmedQuery;

        if (prefix) {
            return this.searchByCategory(prefix, actualQuery, limit);
        }

        const [users, topics, jobs, problems, companies, communities, courses] = await Promise.all([
            this.searchUsers(actualQuery, 5),
            this.searchTopics(actualQuery, 5),
            this.searchJobs(actualQuery, 5),
            this.searchProblems(actualQuery, 5),
            this.searchCompanies(actualQuery, 5),
            this.searchCommunities(actualQuery, 5),
            this.searchCourses(actualQuery, 5)
        ]);

        const allResults = [
            ...users,
            ...topics,
            ...communities,
            ...companies,
            ...courses,
            ...jobs,
            ...problems,
        ];

        const limitedResults = allResults.slice(0, 6);

        return {
            users: limitedResults.filter(r => r.type === SearchResultType.USER),
            topics: limitedResults.filter(r => r.type === SearchResultType.TOPIC),
            communities: limitedResults.filter(r => r.type === SearchResultType.COMMUNITY),
            companies: limitedResults.filter(r => r.type === SearchResultType.COMPANY),
            jobs: limitedResults.filter(r => r.type === SearchResultType.JOB),
            problems: limitedResults.filter(r => r.type === SearchResultType.PROBLEM),
            courses: limitedResults.filter(r => r.type === SearchResultType.COURSE),
        };
    }

    private extractPrefix(query: string): SearchResultType | null {
        const p = query.slice(0, 2).toLowerCase();
        switch (p) {
            case "u/": return SearchResultType.USER;
            case "t/": return SearchResultType.TOPIC;
            case "j/": return SearchResultType.JOB;
            case "p/": return SearchResultType.PROBLEM;
            case "c/": return SearchResultType.COMPANY;
            case "d/": return SearchResultType.COMMUNITY;
            case "l/": return SearchResultType.COURSE;
            default: return null;
        }
    }

    private async searchByCategory(type: SearchResultType, query: string, limit: number) {
        switch (type) {
            case SearchResultType.USER: return { users: await this.searchUsers(query, limit) };
            case SearchResultType.TOPIC: return { topics: await this.searchTopics(query, limit) };
            case SearchResultType.JOB: return { jobs: await this.searchJobs(query, limit) };
            case SearchResultType.PROBLEM: return { problems: await this.searchProblems(query, limit) };
            case SearchResultType.COMPANY: return { companies: await this.searchCompanies(query, limit) };
            case SearchResultType.COMMUNITY: return { communities: await this.searchCommunities(query, limit) };
            case SearchResultType.COURSE: return { courses: await this.searchCourses(query, limit) };
            default: return {};
        }
    }

    private async searchUsers(query: string, limit: number): Promise<SearchResultDTO[]> {
        const users = await this.userRepository.searchUsers(query, undefined, limit);
        return users.map(u => {
            const firstName = (u as any).firstName || "";
            const lastName = (u as any).lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            const displayName = fullName || u.username!;

            return {
                id: u.id!,
                name: displayName,
                slug: u.username!,
                type: SearchResultType.USER,
                iconUrl: u.avatarUrl || null,
                metadata: { aura: (u as any).auraPoints || 0 }
            };
        });
    }

    private async searchTopics(query: string, limit: number): Promise<SearchResultDTO[]> {
        const topics = await this.topicRepository.search(query, limit);
        return topics.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            type: SearchResultType.TOPIC,
            iconUrl: null,
            metadata: { count: t.count }
        }));
    }

    private async searchJobs(query: string, limit: number): Promise<SearchResultDTO[]> {
        const { jobs } = await this.jobRepository.findAll({ query, take: limit });
        return jobs.map(j => ({
            id: j.id,
            name: j.title,
            slug: j.slug,
            type: SearchResultType.JOB,
            iconUrl: (j.company as any)?.logoUrl || null,
            metadata: { companyName: (j.company as any)?.name }
        }));
    }

    private async searchProblems(query: string, limit: number): Promise<SearchResultDTO[]> {
        const problems = await this.problemRepository.findMany({ search: query, limit });
        return problems.slice(0, limit).map(p => ({
            id: p.id,
            name: p.title,
            slug: p.slug,
            type: SearchResultType.PROBLEM,
            iconUrl: null,
            metadata: { difficulty: p.difficulty }
        }));
    }

    private async searchCompanies(query: string, limit: number): Promise<SearchResultDTO[]> {
        // Need to explicitly select slug for the 'c/{slug}' requirement
        const companies = await (this.companyRepository as any).prisma.company.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
            take: limit,
            select: { id: true, name: true, slug: true, logoUrl: true }
        }) as any[];

        return companies.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            type: SearchResultType.COMPANY,
            iconUrl: c.logoUrl
        }));
    }

    private async searchCommunities(query: string, limit: number): Promise<SearchResultDTO[]> {
        const communities = await this.communityRepository.search(query, limit);
        return Promise.all(communities.map(async (c) => {
            const stats = await this.communityRepository.getWeeklyStats(c.id);
            return {
                id: c.id,
                name: c.name,
                slug: c.name,
                type: SearchResultType.COMMUNITY,
                iconUrl: c.iconUrl,
                metadata: { visitors: stats.visitors }
            };
        }));
    }

    private async searchCourses(query: string, limit: number): Promise<SearchResultDTO[]> {
        const courses = await this.courseRepository.findMany({ search: query, limit });
        return (courses as any[]).slice(0, limit).map((c) => ({
            id: c.id,
            name: c.title,
            slug: c.slug,
            type: SearchResultType.COURSE,
            iconUrl: c.thumbnailUrl || null,
            metadata: { author: c.author?.username }
        }));
    }
}
