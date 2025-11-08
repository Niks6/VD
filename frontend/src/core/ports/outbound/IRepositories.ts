// Outbound port - Repository/API interface
import { Route, RouteFilters } from '../domain/Route';
import { ComparisonData } from '../domain/Comparison';
import { ComplianceBalance, BankingRequest, BankingResult, ApplyBankingRequest } from '../domain/Banking';
import { AdjustedCompliance, CreatePoolRequest, Pool } from '../domain/Pooling';

export interface IRoutesRepository {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonData>;
}

export interface IBankingRepository {
  getComplianceBalance(year: number): Promise<ComplianceBalance>;
  bankSurplus(request: BankingRequest): Promise<BankingResult>;
  applyBanked(request: ApplyBankingRequest): Promise<BankingResult>;
}

export interface IPoolingRepository {
  getAdjustedCompliance(year: number): Promise<AdjustedCompliance[]>;
  createPool(request: CreatePoolRequest): Promise<Pool>;
}
