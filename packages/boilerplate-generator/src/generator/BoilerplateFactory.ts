import { Language } from "../types";
import { ProblemStructure, languages } from "../types";
import { SkeletonGenerator } from "./SkeletonGenerator";
import { WrapperGenerator } from "./CodeWrapper";


export class BoilerplateFactory {

    static generateUI(struct: ProblemStructure, lang: Language): string {
        const generators = SkeletonGenerator as unknown as Record<Language, (s: ProblemStructure) => string>;
        if (generators[lang]) return generators[lang](struct);
        throw new Error(`UI generator not implemented for ${lang}`);
    }

    static generateFull(struct: ProblemStructure, lang: Language): string {
        const generators = WrapperGenerator as unknown as Record<Language, (s: ProblemStructure) => string>;
        if (generators[lang]) return generators[lang](struct);
        throw new Error(`Full generator not implemented for ${lang}`);
    }

    static generateAll(structure: ProblemStructure): {
        ui: Record<Language, string>;
        full: Record<Language, string>;
    } {
        const ui: Record<string, string> = {};
        const full: Record<string, string> = {};

        for (const lang of languages) {
            ui[lang] = this.generateUI(structure, lang);
            full[lang] = this.generateFull(structure, lang);
        }

        return { ui: ui as Record<Language, string>, full: full as Record<Language, string> };
    }
}