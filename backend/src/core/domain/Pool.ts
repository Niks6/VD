// Domain entity for Pooling
export interface Pool {
  id: string;
  year: number;
  totalCb: number;
  createdAt: Date;
  members: PoolMember[];
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolRequest {
  year: number;
  shipIds: string[];
}

export interface PoolValidationResult {
  isValid: boolean;
  totalCB: number;
  members: PoolMemberAllocation[];
  errors: string[];
}

export interface PoolMemberAllocation {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  allocation: number;
}
