// Shared constants for Fuel EU compliance calculations
export const FUEL_EU_CONSTANTS = {
  // Target GHG intensity: 2% below baseline (91.16 gCO₂e/MJ)
  TARGET_GHG_INTENSITY: 89.3368, // gCO₂e/MJ
  
  // Energy conversion factor
  ENERGY_CONVERSION_FACTOR: 41000, // MJ per tonne of fuel
  
  // Baseline intensity
  BASELINE_INTENSITY: 91.16, // gCO₂e/MJ
};

/**
 * Calculate energy in scope (MJ)
 * Formula: Energy = fuelConsumption (tonnes) × 41,000 (MJ/tonne)
 */
export function calculateEnergy(fuelConsumption: number): number {
  return fuelConsumption * FUEL_EU_CONSTANTS.ENERGY_CONVERSION_FACTOR;
}

/**
 * Calculate Compliance Balance
 * Formula: CB = (Target - Actual) × Energy in scope
 * Positive CB = Surplus (better than target)
 * Negative CB = Deficit (worse than target)
 */
export function calculateComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  energyInScope: number
): number {
  return (targetIntensity - actualIntensity) * energyInScope;
}

/**
 * Calculate percentage difference
 * Formula: ((comparison / baseline) - 1) × 100
 */
export function calculatePercentDiff(baseline: number, comparison: number): number {
  if (baseline === 0) return 0;
  return ((comparison / baseline) - 1) * 100;
}
