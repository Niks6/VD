// Domain entity for Pooling (Article 21)
export interface AdjustedCompliance {
  vessel: string;
  year: number;
  adjustedCB: number;
}

export interface PoolMember {
  vessel: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  poolId: string;
  year: number;
  members: PoolMember[];
  totalCB: number;
  isValid: boolean;
}

export interface CreatePoolRequest {
  year: number;
  vessels: string[];
}

export interface PoolValidationResult {
  isValid: boolean;
  totalCB: number;
  members: PoolMember[];
  errors: string[];
}
