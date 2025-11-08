import { IComplianceService } from '../ports/IServices';
import { IComplianceRepository, IRoutesRepository } from '../ports/IRepositories';
import { ComplianceBalance, AdjustedCompliance } from '../domain/Compliance';
import { IBankingRepository } from '../ports/IRepositories';
import {
  FUEL_EU_CONSTANTS,
  calculateEnergy,
  calculateComplianceBalance,
} from '../../shared/calculations';

export class ComplianceService implements IComplianceService {
  constructor(
    private readonly complianceRepository: IComplianceRepository,
    private readonly routesRepository: IRoutesRepository,
    private readonly bankingRepository: IBankingRepository
  ) {}

  /**
   * Compute compliance balance for a ship in a specific year
   * Uses route data to calculate CB = (Target - Actual) × Energy
   */
  async computeComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    // Find route data for this ship/year
    const route = await this.routesRepository.findByRouteId(shipId);
    if (!route) {
      throw new Error(`Route not found for ship ${shipId}`);
    }

    if (route.year !== year) {
      throw new Error(`Route year ${route.year} does not match requested year ${year}`);
    }

    // Calculate energy in scope
    const energy = calculateEnergy(route.fuelConsumption);

    // Get target intensity (can be year-specific in the future)
    const target = FUEL_EU_CONSTANTS.TARGET_GHG_INTENSITY;
    const actual = route.ghgIntensity;

    // Calculate compliance balance
    const cb = calculateComplianceBalance(target, actual, energy);

    // Store in database
    await this.complianceRepository.create({
      shipId,
      year,
      cbGco2eq: cb,
      energy,
      actual,
      target,
    });

    return {
      shipId,
      year,
      cb,
      energy,
      actual,
      target,
    };
  }

  /**
   * Get stored compliance balance
   */
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    let compliance = await this.complianceRepository.findByShipAndYear(shipId, year);

    // If not found, compute it
    if (!compliance) {
      return this.computeComplianceBalance(shipId, year);
    }

    return {
      shipId: compliance.shipId,
      year: compliance.year,
      cb: compliance.cbGco2eq,
      energy: compliance.energy,
      actual: compliance.actual,
      target: compliance.target,
    };
  }

  /**
   * Get adjusted compliance balance after banking applications
   */
  async getAdjustedCompliance(shipId: string, year: number): Promise<AdjustedCompliance> {
    // Get original compliance balance
    const originalCB = await this.getComplianceBalance(shipId, year);

    // Get all banking entries applied to this year
    const appliedBankEntries = await this.bankingRepository.findByShipAndYear(shipId, year);
    const appliedBanking = appliedBankEntries
      .filter(entry => entry.applied && entry.appliedYear === year)
      .reduce((sum, entry) => sum + entry.amountGco2eq, 0);

    // Adjusted CB = Original CB + Applied Banking
    const adjustedCB = originalCB.cb + appliedBanking;

    return {
      shipId,
      year,
      adjustedCB,
      originalCB: originalCB.cb,
      appliedBanking,
    };
  }
}
