import { IRoutesService } from '../ports/IServices';
import { IRoutesRepository } from '../ports/IRepositories';
import { Route, RouteFilters } from '../domain/Route';
import { ComparisonResult } from '../domain/Comparison';
import { FUEL_EU_CONSTANTS, calculatePercentDiff } from '../../shared/calculations';

export class RoutesService implements IRoutesService {
  constructor(private readonly routesRepository: IRoutesRepository) {}

  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    return this.routesRepository.findAll(filters);
  }

  async setBaseline(routeId: string): Promise<void> {
    const route = await this.routesRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    await this.routesRepository.setBaseline(routeId);
  }

  async getComparison(): Promise<ComparisonResult> {
    // Find baseline route
    const baseline = await this.routesRepository.findBaseline();
    if (!baseline) {
      throw new Error('No baseline route set');
    }

    // Get all routes for comparison (excluding baseline)
    const allRoutes = await this.routesRepository.findAll();
    const comparisonRoutes = allRoutes.filter(r => r.routeId !== baseline.routeId);
    
    if (comparisonRoutes.length === 0) {
      throw new Error('No routes available for comparison');
    }

    // Use the first non-baseline route as comparison
    // In production, you might want to specify which route to compare
    const comparison = comparisonRoutes[0];

    // Calculate percentage difference
    const percentDiff = calculatePercentDiff(
      baseline.ghgIntensity,
      comparison.ghgIntensity
    );

    // Check if compliant (comparison intensity must be <= target)
    const compliant = comparison.ghgIntensity <= FUEL_EU_CONSTANTS.TARGET_GHG_INTENSITY;

    return {
      baseline: {
        routeId: baseline.routeId,
        ghgIntensity: baseline.ghgIntensity,
        fuelConsumption: baseline.fuelConsumption,
        totalEmissions: baseline.totalEmissions,
      },
      comparison: {
        routeId: comparison.routeId,
        ghgIntensity: comparison.ghgIntensity,
        fuelConsumption: comparison.fuelConsumption,
        totalEmissions: comparison.totalEmissions,
      },
      percentDiff,
      compliant,
      target: FUEL_EU_CONSTANTS.TARGET_GHG_INTENSITY,
    };
  }
}
