import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { CompanyRepository } from "./company.repository";
import type { CompanySearchResponse } from "./company.types";

@injectable()
export class CompanyService {
    constructor(
        @inject(TYPES.CompanyRepository) private companyRepository: CompanyRepository
    ) { }

    async searchCompanies(query: string): Promise<CompanySearchResponse[]> {
        return this.companyRepository.searchCompanies(query);
    }
}
