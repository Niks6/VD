// Domain entity for Banking (Article 20)
export interface ComplianceBalance {
  shipId: string;
  year: number;
  cb: number; // Compliance Balance
  energy?: number;
  actual?: number;
  target?: number;
  vessel?: string;
}

export interface BankingRequest {
  year: number;
  amount: number;
}

export interface BankingResult {
  cb_before: number;
  applied: number;
  cb_after: number;
  year: number;
}

export interface ApplyBankingRequest {
  deficitYear: number;
  amount: number;
}
