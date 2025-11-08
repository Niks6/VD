import { IBankingService } from '../ports/IServices';
import { IBankingRepository, IComplianceRepository } from '../ports/IRepositories';
import { BankingResult, BankSurplusRequest, ApplyBankingRequest } from '../domain/Banking';

export class BankingService implements IBankingService {
  constructor(
    private readonly bankingRepository: IBankingRepository,
    private readonly complianceRepository: IComplianceRepository
  ) {}

  /**
   * Bank positive compliance balance for future use
   * Article 20 - Banking
   */
  async bankSurplus(request: BankSurplusRequest): Promise<BankingResult> {
    const { shipId, year, amount } = request;

    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('Cannot bank non-positive amount');
    }

    // Get current compliance balance
    const compliance = await this.complianceRepository.findByShipAndYear(shipId, year);
    if (!compliance) {
      throw new Error(`Compliance balance not found for ship ${shipId} in year ${year}`);
    }

    const cbBefore = compliance.cbGco2eq;

    // Validate ship has sufficient surplus
    if (cbBefore <= 0) {
      throw new Error('Cannot bank from negative or zero compliance balance');
    }

    if (amount > cbBefore) {
      throw new Error(`Amount ${amount} exceeds available surplus ${cbBefore}`);
    }

    // Create bank entry
    await this.bankingRepository.create({
      shipId,
      year,
      amountGco2eq: amount,
      applied: false,
      appliedYear: null,
    });

    // Update compliance balance
    const cbAfter = cbBefore - amount;
    await this.complianceRepository.update(compliance.id, {
      cbGco2eq: cbAfter,
    });

    return {
      cb_before: cbBefore,
      applied: amount,
      cb_after: cbAfter,
      year,
    };
  }

  /**
   * Apply banked surplus to a deficit year
   */
  async applyBanked(request: ApplyBankingRequest): Promise<BankingResult> {
    const { shipId, deficitYear, amount } = request;

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check available banked balance
    const availableBalance = await this.getAvailableBalance(shipId);
    if (amount > availableBalance) {
      throw new Error(
        `Insufficient banked balance. Requested: ${amount}, Available: ${availableBalance}`
      );
    }

    // Get deficit year compliance
    const deficitCompliance = await this.complianceRepository.findByShipAndYear(
      shipId,
      deficitYear
    );
    if (!deficitCompliance) {
      throw new Error(`Compliance balance not found for year ${deficitYear}`);
    }

    const cbBefore = deficitCompliance.cbGco2eq;

    // Apply banking entries (FIFO - First In First Out)
    await this.bankingRepository.applyBanking(shipId, amount, deficitYear);

    // Update deficit year compliance balance
    const cbAfter = cbBefore + amount;
    await this.complianceRepository.update(deficitCompliance.id, {
      cbGco2eq: cbAfter,
    });

    return {
      cb_before: cbBefore,
      applied: amount,
      cb_after: cbAfter,
      year: deficitYear,
    };
  }

  /**
   * Get available banked balance (not yet applied)
   */
  async getAvailableBalance(shipId: string): Promise<number> {
    return this.bankingRepository.findAvailableBalance(shipId);
  }

  /**
   * Get banking records for a ship, optionally filtered by year
   */
  async getBankingRecords(shipId: string, year?: number): Promise<any[]> {
    return this.bankingRepository.findByShipAndYear(shipId, year);
  }
}
