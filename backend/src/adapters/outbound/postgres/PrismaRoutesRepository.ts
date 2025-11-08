import { PrismaClient } from '@prisma/client';
import { IRoutesRepository } from '../../core/ports/IRepositories';
import { Route, RouteFilters, CreateRouteDTO } from '../../core/domain/Route';

export class PrismaRoutesRepository implements IRoutesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(filters?: RouteFilters): Promise<Route[]> {
    const where: any = {};

    if (filters?.vesselType) {
      where.vesselType = filters.vesselType;
    }
    if (filters?.fuelType) {
      where.fuelType = filters.fuelType;
    }
    if (filters?.year) {
      where.year = filters.year;
    }

    return this.prisma.route.findMany({ where });
  }

  async findById(id: string): Promise<Route | null> {
    return this.prisma.route.findUnique({ where: { id } });
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    return this.prisma.route.findUnique({ where: { routeId } });
  }

  async findByYear(year: number): Promise<Route[]> {
    return this.prisma.route.findMany({ where: { year } });
  }

  async findBaseline(): Promise<Route | null> {
    return this.prisma.route.findFirst({ where: { isBaseline: true } });
  }

  async create(data: CreateRouteDTO): Promise<Route> {
    return this.prisma.route.create({ data });
  }

  async setBaseline(routeId: string): Promise<void> {
    // First, unset all existing baselines
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false },
    });

    // Set new baseline
    await this.prisma.route.update({
      where: { routeId },
      data: { isBaseline: true },
    });
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    return this.prisma.route.update({ where: { id }, data });
  }
}
