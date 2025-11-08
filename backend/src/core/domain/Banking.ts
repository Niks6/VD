// Domain entity for Banking
export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  applied: boolean;
  appliedYear: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankSurplusRequest {
  shipId: string;
  year: number;
  amount: number;
}

export interface ApplyBankingRequest {
  shipId: string;
  deficitYear: number;
  amount: number;
}

export interface BankingResult {
  cb_before: number;
  applied: number;
  cb_after: number;
  year: number;
}

export interface AdjustedCompliance {
  shipId: string;
  year: number;
  adjustedCB: number;
  originalCB: number;
  appliedBanking: number;
}
