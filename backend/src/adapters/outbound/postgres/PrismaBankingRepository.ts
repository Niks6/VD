import { PrismaClient } from '@prisma/client';
import { IBankingRepository } from '../../core/ports/IRepositories';
import { BankEntry } from '../../core/domain/Banking';

export class PrismaBankingRepository implements IBankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year?: number): Promise<BankEntry[]> {
    if (year === undefined) {
      // Return all entries for the ship
      return this.prisma.bankEntry.findMany({
        where: { shipId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.bankEntry.findMany({
      where: {
        OR: [
          { shipId, year }, // Entries created in this year
          { shipId, appliedYear: year }, // Entries applied to this year
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailableBalance(shipId: string): Promise<number> {
    const entries = await this.prisma.bankEntry.findMany({
      where: {
        shipId,
        applied: false,
      },
    });

    return entries.reduce((sum, entry) => sum + entry.amountGco2eq, 0);
  }

  async create(
    data: Omit<BankEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BankEntry> {
    return this.prisma.bankEntry.create({ data });
  }

  async applyBanking(shipId: string, amount: number, year: number): Promise<BankEntry[]> {
    // Get available (not applied) bank entries ordered by creation date (FIFO)
    const availableEntries = await this.prisma.bankEntry.findMany({
      where: {
        shipId,
        applied: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let remainingAmount = amount;
    const updatedEntries: BankEntry[] = [];

    for (const entry of availableEntries) {
      if (remainingAmount <= 0) break;

      if (entry.amountGco2eq <= remainingAmount) {
        // Use entire entry
        const updated = await this.prisma.bankEntry.update({
          where: { id: entry.id },
          data: {
            applied: true,
            appliedYear: year,
          },
        });
        updatedEntries.push(updated);
        remainingAmount -= entry.amountGco2eq;
      } else {
        // Partial use - split the entry
        // Mark original as applied
        const updated = await this.prisma.bankEntry.update({
          where: { id: entry.id },
          data: {
            applied: true,
            appliedYear: year,
            amountGco2eq: remainingAmount,
          },
        });
        updatedEntries.push(updated);

        // Create new entry for remaining amount
        await this.prisma.bankEntry.create({
          data: {
            shipId: entry.shipId,
            year: entry.year,
            amountGco2eq: entry.amountGco2eq - remainingAmount,
            applied: false,
            appliedYear: null,
          },
        });

        remainingAmount = 0;
      }
    }

    if (remainingAmount > 0) {
      throw new Error('Insufficient banked balance');
    }

    return updatedEntries;
  }
}
