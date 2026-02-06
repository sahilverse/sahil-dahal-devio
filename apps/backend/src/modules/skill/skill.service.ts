import { injectable, inject } from "inversify";
import { SkillRepository } from "./skill.repository";
import type { Skill } from "../../generated/prisma/client";
import { TYPES } from "../../types";
import slugify from "slugify";

@injectable()
export class SkillService {
    constructor(
        @inject(TYPES.SkillRepository) private skillRepository: SkillRepository
    ) { }

    async createSkill(name: string): Promise<Skill> {
        const slug = slugify(name, { lower: true, strict: true });

        const existingSkill = await this.skillRepository.findBySlug(slug);
        if (existingSkill) {
            return existingSkill;
        }

        return this.skillRepository.create(name, slug);
    }

    async searchSkills(query: string): Promise<Skill[]> {
        return this.skillRepository.search(query);
    }

    async findSkillByName(name: string): Promise<Skill | null> {
        return this.skillRepository.findByName(name);
    }

    async findSkillBySlug(slug: string): Promise<Skill | null> {
        return this.skillRepository.findBySlug(slug);
    }
}
