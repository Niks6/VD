import { PrismaClient } from '@prisma/client';
import { IPoolingRepository } from '../../../core/ports/IRepositories';
import { Pool, CreatePoolRequest, PoolMember } from '../../../core/domain/Pool';

export class PrismaPoolingRepository implements IPoolingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePoolRequest, members: PoolMember[]): Promise<Pool> {
    const totalCb = members.reduce((sum, m) => sum + m.cbAfter, 0);

    const pool = await this.prisma.pool.create({
      data: {
        year: data.year,
        totalCb,
        members: {
          create: members.map(m => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return pool;
  }

  async findById(id: string): Promise<Pool | null> {
    return this.prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async findByYear(year: number): Promise<Pool[]> {
    return this.prisma.pool.findMany({
      where: { year },
      include: { members: true },
    });
  }
}
