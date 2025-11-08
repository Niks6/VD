// Inbound ports - Use case interfaces
import { Route, RouteFilters } from '../domain/Route';
import { ComplianceBalance, AdjustedCompliance } from '../domain/Compliance';
import { BankingResult, BankSurplusRequest, ApplyBankingRequest, BankEntry } from '../domain/Banking';
import { Pool, CreatePoolRequest, PoolValidationResult } from '../domain/Pool';
import { ComparisonResult } from '../domain/Comparison';

// Routes Use Cases
export interface IRoutesService {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonResult>;
}

// Compliance Use Cases
export interface IComplianceService {
  computeComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCompliance(shipId: string, year: number): Promise<AdjustedCompliance>;
}

// Banking Use Cases
export interface IBankingService {
  bankSurplus(request: BankSurplusRequest): Promise<BankingResult>;
  applyBanked(request: ApplyBankingRequest): Promise<BankingResult>;
  getAvailableBalance(shipId: string): Promise<number>;
  getBankingRecords(shipId: string, year?: number): Promise<BankEntry[]>;
}

// Pooling Use Cases
export interface IPoolingService {
  validatePool(request: CreatePoolRequest): Promise<PoolValidationResult>;
  createPool(request: CreatePoolRequest): Promise<Pool>;
}
