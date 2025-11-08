import { IBankingUseCase } from '../ports/inbound/IUseCases';
import { IBankingRepository } from '../ports/outbound/IRepositories';
import { ComplianceBalance, BankingResult, ApplyBankingRequest } from '../domain/Banking';

export class BankingUseCase implements IBankingUseCase {
  constructor(private repository: IBankingRepository) {}

  async getComplianceBalance(year: number): Promise<ComplianceBalance> {
    return this.repository.getComplianceBalance(year);
  }

  async bankSurplus(year: number, amount: number): Promise<BankingResult> {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('Cannot bank non-positive compliance balance');
    }

    return this.repository.bankSurplus({ year, amount });
  }

  async applyBanked(request: ApplyBankingRequest): Promise<BankingResult> {
    // Validate amount is positive
    if (request.amount <= 0) {
      throw new Error('Cannot apply non-positive amount');
    }

    return this.repository.applyBanked(request);
  }
}
