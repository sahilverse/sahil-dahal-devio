import api from "./axios";
import type { Skill } from "@/types/profile";

export const SkillService = {
    searchSkills: async (query: string): Promise<Skill[]> => {
        const { data } = await api.get("/skills/search", { params: { q: query } });
        return data.result;
    },

    createSkill: async (name: string): Promise<Skill> => {
        const { data } = await api.post("/skills", { name });
        return data.result;
    },
};
