// Domain entity for Compliance Balance
export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number; // Compliance Balance in gCO₂e
  energy: number; // Energy in scope (MJ)
  actual: number; // Actual GHG intensity
  target: number; // Target GHG intensity
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceCalculation {
  shipId: string;
  year: number;
  fuelConsumption: number; // tonnes
  ghgIntensity: number; // gCO₂e/MJ
  targetIntensity: number; // gCO₂e/MJ (default 89.3368)
  energyConversionFactor: number; // MJ/t (default 41000)
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cb: number; // Compliance Balance
  energy: number;
  actual: number;
  target: number;
}

export interface AdjustedCompliance {
  shipId: string;
  year: number;
  adjustedCB: number;
  originalCB: number;
  appliedBanking: number;
}
