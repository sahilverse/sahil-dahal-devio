import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ProblemDraftRepository } from "./draft.repository";

@injectable()
export class ProblemDraftService {
    constructor(
        @inject(TYPES.ProblemDraftRepository) private draftRepository: ProblemDraftRepository
    ) { }

    async saveDraft(userId: string, problemId: string, language: string, code: string) {
        return this.draftRepository.upsertDraft(userId, problemId, language, code);
    }

    async getDraft(userId: string, problemId: string, language: string) {
        return this.draftRepository.findDraft(userId, problemId, language);
    }

    async getProblemDrafts(userId: string, problemId: string) {
        return this.draftRepository.findAllDraftsForProblem(userId, problemId);
    }
}
