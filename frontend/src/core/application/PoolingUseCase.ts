import { IPoolingUseCase } from '../ports/inbound/IUseCases';
import { IPoolingRepository } from '../ports/outbound/IRepositories';
import { AdjustedCompliance, Pool, CreatePoolRequest, PoolValidationResult, PoolMember } from '../domain/Pooling';

export class PoolingUseCase implements IPoolingUseCase {
  constructor(private repository: IPoolingRepository) {}

  async getAdjustedCompliance(year: number): Promise<AdjustedCompliance[]> {
    return this.repository.getAdjustedCompliance(year);
  }

  async validatePool(request: CreatePoolRequest): Promise<PoolValidationResult> {
    const vessels = await this.repository.getAdjustedCompliance(request.year);
    const poolMembers = vessels.filter(v => request.vessels.includes(v.vessel));
    
    const errors: string[] = [];
    const members: PoolMember[] = [];
    let totalCB = 0;

    // Calculate total CB
    poolMembers.forEach(member => {
      totalCB += member.adjustedCB;
      members.push({
        vessel: member.vessel,
        cbBefore: member.adjustedCB,
        cbAfter: 0 // Will be calculated after pool distribution
      });
    });

    // Validation rules
    if (poolMembers.length < 2) {
      errors.push('Pool must have at least 2 vessels');
    }

    // Rule 1: Sum of adjusted CB must be >= 0
    if (totalCB < 0) {
      errors.push(`Pool total CB is negative (${totalCB.toFixed(2)}). Cannot create pool.`);
    }

    // Rule 2 & 3: Check deficit and surplus ships
    const hasDeficit = poolMembers.some(m => m.adjustedCB < 0);
    const hasSurplus = poolMembers.some(m => m.adjustedCB > 0);

    if (hasDeficit && totalCB >= 0) {
      // Distribute evenly (simplified logic - can be enhanced)
      const distribution = totalCB / poolMembers.length;
      members.forEach((m, idx) => {
        m.cbAfter = distribution;
        
        // Rule 2: Deficit ship cannot exit worse
        if (poolMembers[idx].adjustedCB < 0 && m.cbAfter < poolMembers[idx].adjustedCB) {
          errors.push(`Vessel ${m.vessel} would exit worse than entry`);
        }
        
        // Rule 3: Surplus ship cannot exit negative
        if (poolMembers[idx].adjustedCB > 0 && m.cbAfter < 0) {
          errors.push(`Vessel ${m.vessel} would exit negative`);
        }
      });
    }

    return {
      isValid: errors.length === 0 && totalCB >= 0,
      totalCB,
      members,
      errors
    };
  }

  async createPool(request: CreatePoolRequest): Promise<Pool> {
    const validation = await this.validatePool(request);
    
    if (!validation.isValid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(', ')}`);
    }

    return this.repository.createPool(request);
  }
}
