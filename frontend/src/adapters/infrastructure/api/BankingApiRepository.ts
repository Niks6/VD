import { IBankingRepository } from '../../../core/ports/outbound/IRepositories';
import { ComplianceBalance, BankingRequest, BankingResult, ApplyBankingRequest } from '../../../core/domain/Banking';
import { ApiClient } from './ApiClient';

export class BankingApiRepository implements IBankingRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getComplianceBalance(year: number): Promise<ComplianceBalance> {
    return this.apiClient.get<ComplianceBalance>(`/compliance/cb?year=${year}`);
  }

  async bankSurplus(request: BankingRequest): Promise<BankingResult> {
    return this.apiClient.post<BankingResult>('/banking/bank', request);
  }

  async applyBanked(request: ApplyBankingRequest): Promise<BankingResult> {
    return this.apiClient.post<BankingResult>('/banking/apply', request);
  }
}
