import { PrismaClient } from '@prisma/client';
import { IComplianceRepository } from '../../core/ports/IRepositories';
import { ShipCompliance } from '../../core/domain/Compliance';

export class PrismaComplianceRepository implements IComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
    return this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: { shipId, year },
      },
    });
  }

  async create(
    data: Omit<ShipCompliance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.create({ data });
  }

  async update(id: string, data: Partial<ShipCompliance>): Promise<ShipCompliance> {
    return this.prisma.shipCompliance.update({
      where: { id },
      data,
    });
  }
}
