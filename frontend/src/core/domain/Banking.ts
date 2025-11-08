// Domain entity for Banking (Article 20)
export interface ComplianceBalance {
  year: number;
  cb: number; // Compliance Balance
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
