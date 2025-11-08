// Domain entity for Route Comparison
export interface ComparisonData {
  baseline: ComparisonRoute;
  comparison: ComparisonRoute;
  target: number; // 89.3368 gCO₂e/MJ (2% below 91.16)
}

export interface ComparisonRoute {
  routeId: string;
  ghgIntensity: number;
  fuelConsumption: number;
  totalEmissions: number;
}

export interface ComparisonResult {
  baseline: ComparisonRoute;
  comparison: ComparisonRoute;
  percentDiff: number;
  isCompliant: boolean;
  target: number;
}

export const FUELEU_TARGET = 89.3368; // 2% below 91.16
