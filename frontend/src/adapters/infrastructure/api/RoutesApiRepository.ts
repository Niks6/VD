import { IRoutesRepository } from '../../../core/ports/outbound/IRepositories';
import { Route, RouteFilters } from '../../../core/domain/Route';
import { ComparisonData } from '../../../core/domain/Comparison';
import { ApiClient } from './ApiClient';

export class RoutesApiRepository implements IRoutesRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const params = new URLSearchParams();
    
    if (filters?.vesselType) {
      params.append('vesselType', filters.vesselType);
    }
    if (filters?.fuelType) {
      params.append('fuelType', filters.fuelType);
    }
    if (filters?.year) {
      params.append('year', filters.year.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/routes?${queryString}` : '/routes';
    
    return this.apiClient.get<Route[]>(endpoint);
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.apiClient.post(`/routes/${routeId}/baseline`);
  }

  async getComparison(): Promise<ComparisonData> {
    return this.apiClient.get<ComparisonData>('/routes/comparison');
  }
}
