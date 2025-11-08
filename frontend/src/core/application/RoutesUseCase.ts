import { IRoutesUseCase } from '../ports/inbound/IUseCases';
import { IRoutesRepository } from '../ports/outbound/IRepositories';
import { Route, RouteFilters } from '../domain/Route';
import { ComparisonResult, FUELEU_TARGET } from '../domain/Comparison';

export class RoutesUseCase implements IRoutesUseCase {
  constructor(private repository: IRoutesRepository) {}

  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    return this.repository.getRoutes(filters);
  }

  async setBaseline(routeId: string): Promise<void> {
    return this.repository.setBaseline(routeId);
  }
}

export class ComparisonUseCase {
  constructor(private repository: IRoutesRepository) {}

  async getComparison(): Promise<ComparisonResult> {
    const data = await this.repository.getComparison();
    
    // Calculate percentage difference
    const percentDiff = ((data.comparison.ghgIntensity / data.baseline.ghgIntensity) - 1) * 100;
    
    // Check compliance against target
    const isCompliant = data.comparison.ghgIntensity <= FUELEU_TARGET;
    
    return {
      baseline: data.baseline,
      comparison: data.comparison,
      percentDiff,
      isCompliant,
      target: FUELEU_TARGET
    };
  }
}
