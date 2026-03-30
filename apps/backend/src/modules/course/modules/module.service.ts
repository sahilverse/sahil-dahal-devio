import { injectable, inject } from "inversify";
import { TYPES } from "../../../types";
import { ModuleRepository } from "./module.repository";
import { ApiError } from "../../../utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { CreateModuleInput, UpdateModuleInput, ModuleQueryInput } from "@devio/zod-utils";
import { plainToInstance } from "class-transformer";
import { ModuleSummaryDto } from "../course.dto";

@injectable()
export class ModuleService {
    constructor(@inject(TYPES.ModuleRepository) private moduleRepository: ModuleRepository) { }

    async createModule(courseId: string, data: CreateModuleInput) {
        const mod = await this.moduleRepository.create(courseId, data.title, data.order || 0);
        return plainToInstance(ModuleSummaryDto, mod, { excludeExtraneousValues: true });
    }

    async updateModule(moduleId: string, data: UpdateModuleInput) {
        const mod = await this.moduleRepository.findById(moduleId);
        if (!mod) throw new ApiError("Module not found", StatusCodes.NOT_FOUND);
        const updated = await this.moduleRepository.update(moduleId, data);
        return plainToInstance(ModuleSummaryDto, updated, { excludeExtraneousValues: true });
    }

    async deleteModule(moduleId: string) {
        const mod = await this.moduleRepository.findById(moduleId);
        if (!mod) throw new ApiError("Module not found", StatusCodes.NOT_FOUND);
        await this.moduleRepository.delete(moduleId);
    }

    async getModulesByCourseId(courseId: string, query: ModuleQueryInput) {
        const modules = await this.moduleRepository.findManyByCourseId(
            courseId,
            query.limit,
            query.cursor
        );

        let nextCursor: string | null = null;
        if (modules.length > query.limit) {
            const nextItem = modules.pop();
            nextCursor = nextItem?.id || null;
        }

        return {
            items: plainToInstance(ModuleSummaryDto, modules, { excludeExtraneousValues: true }),
            nextCursor,
        };
    }
}
