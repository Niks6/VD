import { IPoolingRepository } from '../../../core/ports/outbound/IRepositories';
import { AdjustedCompliance, CreatePoolRequest, Pool } from '../../../core/domain/Pooling';
import { ApiClient } from './ApiClient';

export class PoolingApiRepository implements IPoolingRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAdjustedCompliance(year: number): Promise<AdjustedCompliance[]> {
    return this.apiClient.get<AdjustedCompliance[]>(`/compliance/adjusted-cb?year=${year}`);
  }

  async createPool(request: CreatePoolRequest): Promise<Pool> {
    return this.apiClient.post<Pool>('/pools', request);
  }
}
