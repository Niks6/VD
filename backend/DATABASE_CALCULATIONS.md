# Database Calculations Summary

## Overview
All database tables have been populated with calculated values using proper formulas mapped to unique `route_id` values.

## Calculation Formulas Used

### 1. **Total Emissions** (tonnes CO₂e)
```
Total Emissions = (Fuel Consumption × 41,000 MJ/tonne × GHG Intensity) / 1,000,000
```

### 2. **Energy in Scope** (MJ)
```
Energy = Fuel Consumption (tonnes) × 41,000 MJ/tonne
```

### 3. **Compliance Balance** (gCO₂e)
```
CB = (Target GHG Intensity - Actual GHG Intensity) × Energy in Scope
```
- **Positive CB** = Surplus (better than target)
- **Negative CB** = Deficit (worse than target)

### 4. **Target GHG Intensity**
```
Target = 89.3368 gCO₂e/MJ (2% below baseline of 91.16)
```

## Seeded Data Results

### Routes Table (8 routes)
| Route ID | Vessel Type | Fuel Type | Year | Fuel (tonnes) | Distance (km) | GHG Intensity | Total Emissions |
|----------|-------------|-----------|------|---------------|---------------|---------------|-----------------|
| R001 | Container | HFO | 2024 | 5,000 | 12,000 | 91.0 | 18,655.00 t |
| R002 | BulkCarrier | LNG | 2024 | 4,800 | 11,500 | 88.0 | 17,318.40 t |
| R003 | Tanker | MGO | 2024 | 5,100 | 12,500 | 93.5 | 19,550.85 t |
| R004 | RoRo | HFO | 2025 | 4,900 | 11,800 | 89.2 | 17,920.28 t |
| R005 | Container | LNG | 2025 | 4,950 | 11,900 | 90.5 | 18,366.97 t |
| R006 | Tanker | Methanol | 2025 | 4,600 | 11,200 | 85.0 | 16,031.00 t |
| R007 | Container | HFO | 2026 | 5,200 | 12,300 | 92.5 | 19,721.00 t |
| R008 | BulkCarrier | MGO | 2026 | 4,700 | 11,000 | 87.5 | 16,861.25 t |

### Compliance Table
| Ship ID | Year | Energy (MJ) | Actual Intensity | Target Intensity | CB (tonnes CO₂e) | Status |
|---------|------|-------------|------------------|------------------|------------------|--------|
| R001 | 2024 | 205,000,000 | 91.0 | 89.3368 | -340.96 | ❌ DEFICIT |
| R002 | 2024 | 196,800,000 | 88.0 | 89.3368 | +263.08 | ✅ SURPLUS |
| R003 | 2024 | 209,100,000 | 93.5 | 89.3368 | -870.53 | ❌ DEFICIT |
| R004 | 2025 | 200,900,000 | 89.2 | 89.3368 | +27.48 | ✅ SURPLUS |
| R005 | 2025 | 202,950,000 | 90.5 | 89.3368 | -236.07 | ❌ DEFICIT |
| R006 | 2025 | 188,600,000 | 85.0 | 89.3368 | +817.92 | ✅ SURPLUS |
| R007 | 2026 | 213,200,000 | 92.5 | 89.3368 | -674.39 | ❌ DEFICIT |
| R008 | 2026 | 192,700,000 | 87.5 | 89.3368 | +353.95 | ✅ SURPLUS |

### Banking Entries
Routes with surplus CB can bank 50% of their surplus for future use:

| Ship ID | Year | Banked Amount (tonnes CO₂e) | Applied | Notes |
|---------|------|------------------------------|---------|-------|
| R002 | 2024 | 131.54 | No | 50% of 263.08 surplus |
| R004 | 2025 | 13.74 | No | 50% of 27.48 surplus |
| R006 | 2025 | 408.96 | No | 50% of 817.92 surplus |
| R008 | 2026 | 176.98 | No | 50% of 353.95 surplus |

### Pooling Data

#### Pool 2024
- **Total CB**: -948.40 tonnes CO₂e (deficit pool)
- **Average per ship**: -316.13 tonnes CO₂e
- **Members**: 3 ships

| Ship ID | CB Before | CB After | Change |
|---------|-----------|----------|--------|
| R002 | +263.08 | -316.13 | -579.22 (gives to pool) |
| R001 | -340.96 | -316.13 | +24.82 (receives from pool) |
| R003 | -870.53 | -316.13 | +554.39 (receives from pool) |

#### Pool 2025
- **Total CB**: +609.33 tonnes CO₂e (surplus pool)
- **Average per ship**: +203.11 tonnes CO₂e
- **Members**: 3 ships

| Ship ID | CB Before | CB After | Change |
|---------|-----------|----------|--------|
| R004 | +27.48 | +203.11 | +175.63 (receives from pool) |
| R006 | +817.92 | +203.11 | -614.81 (gives to pool) |
| R005 | -236.07 | +203.11 | +439.18 (receives from pool) |

## Key Insights

1. **Emission Distribution**: Total emissions range from 16,031 to 19,721 tonnes CO₂e per route
2. **Compliance Status**: 4 routes in surplus, 4 routes in deficit
3. **Fuel Efficiency**: LNG and Methanol show better GHG intensity than traditional HFO/MGO
4. **Banking Mechanism**: 4 ships successfully banked credits totaling 731.22 tonnes CO₂e
5. **Pooling Effectiveness**: 
   - 2024 pool redistributes deficit more evenly
   - 2025 pool turns overall deficit into surplus for all members

## Database Structure
✅ **Routes**: 8 entries with calculated emissions
✅ **Ship Compliance**: 8 entries with calculated CB values
✅ **Bank Entries**: 4 entries for surplus routes
✅ **Pools**: 2 pools (2024, 2025)
✅ **Pool Members**: 6 pool memberships

All calculations follow FuelEU Maritime regulations using the standard formulas and constants defined in `src/shared/calculations.ts`.
