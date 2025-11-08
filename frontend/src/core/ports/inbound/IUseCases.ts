// Inbound port - Use cases interface
import { Route, RouteFilters } from '../domain/Route';
import { ComparisonResult } from '../domain/Comparison';
import { ComplianceBalance, BankingResult, ApplyBankingRequest } from '../domain/Banking';
import { AdjustedCompliance, Pool, CreatePoolRequest, PoolValidationResult } from '../domain/Pooling';

// Routes use cases
export interface IRoutesUseCase {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
}

// Comparison use cases
export interface IComparisonUseCase {
  getComparison(): Promise<ComparisonResult>;
}

// Banking use cases
export interface IBankingUseCase {
  getComplianceBalance(year: number): Promise<ComplianceBalance>;
  bankSurplus(year: number, amount: number): Promise<BankingResult>;
  applyBanked(request: ApplyBankingRequest): Promise<BankingResult>;
}

// Pooling use cases
export interface IPoolingUseCase {
  getAdjustedCompliance(year: number): Promise<AdjustedCompliance[]>;
  validatePool(request: CreatePoolRequest): Promise<PoolValidationResult>;
  createPool(request: CreatePoolRequest): Promise<Pool>;
}
