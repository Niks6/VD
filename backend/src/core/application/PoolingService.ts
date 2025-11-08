import { IPoolingService } from '../ports/IServices';
import { IPoolingRepository, IComplianceRepository } from '../ports/IRepositories';
import { Pool, CreatePoolRequest, PoolValidationResult, PoolMemberAllocation } from '../domain/Pool';

export class PoolingService implements IPoolingService {
  constructor(
    private readonly poolingRepository: IPoolingRepository,
    private readonly complianceRepository: IComplianceRepository
  ) {}

  /**
   * Validate pool creation rules (Article 21)
   * Rules:
   * 1. Sum of adjusted CB >= 0
   * 2. Deficit ship cannot exit worse than entry
   * 3. Surplus ship cannot exit negative
   */
  async validatePool(request: CreatePoolRequest): Promise<PoolValidationResult> {
    const { year, shipIds } = request;
    const errors: string[] = [];

    // Minimum 2 ships required
    if (shipIds.length < 2) {
      errors.push('Pool must have at least 2 vessels');
      return {
        isValid: false,
        totalCB: 0,
        members: [],
        errors,
      };
    }

    // Get compliance balances for all ships
    const members: PoolMemberAllocation[] = [];
    let totalCB = 0;

    for (const shipId of shipIds) {
      const compliance = await this.complianceRepository.findByShipAndYear(shipId, year);
      if (!compliance) {
        errors.push(`Compliance data not found for ship ${shipId} in year ${year}`);
        continue;
      }

      members.push({
        shipId,
        cbBefore: compliance.cbGco2eq,
        cbAfter: 0, // Will be calculated
        allocation: 0,
      });

      totalCB += compliance.cbGco2eq;
    }

    // Rule 1: Total CB must be >= 0
    if (totalCB < 0) {
      errors.push(`Pool total CB is negative (${totalCB.toFixed(2)}). Cannot create pool.`);
    }

    // If total is negative, we can't proceed with allocation
    if (totalCB < 0) {
      return {
        isValid: false,
        totalCB,
        members,
        errors,
      };
    }

    // Greedy allocation algorithm
    // Sort members descending by CB (surplus ships first)
    members.sort((a, b) => b.cbBefore - a.cbBefore);

    // Distribute evenly or use greedy transfer
    const targetCBPerShip = totalCB / members.length;

    // Apply greedy allocation: transfer from surplus to deficit
    const surplusShips = members.filter(m => m.cbBefore > targetCBPerShip);
    const deficitShips = members.filter(m => m.cbBefore < targetCBPerShip);

    // Simple equal distribution first
    members.forEach(member => {
      member.cbAfter = targetCBPerShip;
      member.allocation = member.cbAfter - member.cbBefore;
    });

    // Rule 2: Deficit ship cannot exit worse
    for (const member of members) {
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        errors.push(`Ship ${member.shipId} would exit worse than entry`);
      }
    }

    // Rule 3: Surplus ship cannot exit negative
    for (const member of members) {
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        errors.push(`Ship ${member.shipId} would exit with negative CB`);
      }
    }

    return {
      isValid: errors.length === 0 && totalCB >= 0,
      totalCB,
      members,
      errors,
    };
  }

  /**
   * Create a pool after validation
   */
  async createPool(request: CreatePoolRequest): Promise<Pool> {
    // Validate first
    const validation = await this.validatePool(request);

    if (!validation.isValid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(', ')}`);
    }

    // Create pool with members
    const poolMembers = validation.members.map(m => ({
      id: '', // Will be generated
      poolId: '', // Will be set
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbAfter,
    }));

    const pool = await this.poolingRepository.create(request, poolMembers);

    // Update each ship's compliance balance
    for (const member of validation.members) {
      const compliance = await this.complianceRepository.findByShipAndYear(
        member.shipId,
        request.year
      );
      if (compliance) {
        await this.complianceRepository.update(compliance.id, {
          cbGco2eq: member.cbAfter,
        });
      }
    }

    return pool;
  }
}
