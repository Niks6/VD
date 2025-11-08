// Domain entity for Comparison
export interface ComparisonData {
  baseline: ComparisonRoute;
  comparison: ComparisonRoute;
  target: number;
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
  compliant: boolean;
  target: number;
}
