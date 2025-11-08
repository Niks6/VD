// Outbound ports - Repository interfaces
import { Route, RouteFilters, CreateRouteDTO } from '../domain/Route';
import { ShipCompliance, ComplianceCalculation } from '../domain/Compliance';
import { BankEntry, BankSurplusRequest, ApplyBankingRequest } from '../domain/Banking';
import { Pool, CreatePoolRequest, PoolMember } from '../domain/Pool';
import { ComparisonData } from '../domain/Comparison';

// Routes Repository
export interface IRoutesRepository {
  findAll(filters?: RouteFilters): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  create(data: CreateRouteDTO): Promise<Route>;
  setBaseline(routeId: string): Promise<void>;
  update(id: string, data: Partial<Route>): Promise<Route>;
}

// Compliance Repository
export interface IComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  create(data: Omit<ShipCompliance, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShipCompliance>;
  update(id: string, data: Partial<ShipCompliance>): Promise<ShipCompliance>;
}

// Banking Repository
export interface IBankingRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  findAvailableBalance(shipId: string): Promise<number>;
  create(data: Omit<BankEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankEntry>;
  applyBanking(shipId: string, amount: number, year: number): Promise<BankEntry[]>;
}

// Pooling Repository
export interface IPoolingRepository {
  create(data: CreatePoolRequest, members: PoolMember[]): Promise<Pool>;
  findById(id: string): Promise<Pool | null>;
  findByYear(year: number): Promise<Pool[]>;
}
