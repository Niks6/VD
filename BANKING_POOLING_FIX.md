# Banking and Pooling Tab Fix

## Problem

The Banking and Pooling tabs were showing **400 Bad Request** errors because:

### Root Cause
The frontend was calling the compliance endpoints without the required `shipId` parameter:
- Frontend called: `/compliance/cb?year=2024`
- Backend expected: `/compliance/cb?shipId=R001&year=2024`

This mismatch caused the backend to return:
```json
{
  "error": "shipId and year are required"
}
```

## Solution

### Backend Changes

#### 1. Updated `ComplianceController.ts`
Made the controller handle **both** single-ship and multi-ship requests:
- If `shipId` is provided → return single ship's compliance
- If `shipId` is omitted → return ALL ships for that year

```typescript
// Now supports optional shipId
GET /api/compliance/cb?year=2024  // Returns array of all ships
GET /api/compliance/cb?shipId=R001&year=2024  // Returns single ship
```

#### 2. Added `findByYear()` method
- Added to `IRoutesRepository` interface
- Implemented in `PrismaRoutesRepository`
- Allows fetching all routes for a specific year

#### 3. Updated Controller Initialization
- `ComplianceController` now receives `routesRepository` as a dependency
- Updated in `app.ts`: `new ComplianceController(complianceService, routesRepository)`

### Frontend Changes

#### 1. Updated `ComplianceBalance` Interface
Added `shipId` field to the domain model:
```typescript
export interface ComplianceBalance {
  shipId: string;  // Added
  year: number;
  cb: number;
  energy?: number;
  actual?: number;
  target?: number;
}
```

#### 2. Enhanced `BankingTab.tsx`
- Removed dependency on `useAsync` hook
- Added direct API fetch to get all ships for selected year
- Added ship selector dropdown
- Shows compliance balance for selected ship
- Auto-selects first ship when year changes

**New UI Flow:**
1. Select Year → Fetches all ships for that year
2. Select Ship → Shows that ship's compliance balance
3. Bank Surplus or Apply Banked → Works with selected ship

#### 3. `PoolingTab.tsx` Already Works!
The pooling tab was already correctly structured to handle arrays of ships, so it works without changes once the backend returns the proper data.

## API Endpoints Summary

| Endpoint | Parameters | Returns | Use Case |
|----------|------------|---------|----------|
| `GET /api/compliance/cb` | `year` | `ComplianceBalance[]` | Get all ships' CB for a year |
| `GET /api/compliance/cb` | `shipId`, `year` | `ComplianceBalance` | Get single ship's CB |
| `GET /api/compliance/adjusted-cb` | `year` | `AdjustedCompliance[]` | Get all ships' adjusted CB |
| `GET /api/compliance/adjusted-cb` | `shipId`, `year` | `AdjustedCompliance` | Get single ship's adjusted CB |

## Testing

### Banking Tab
1. Open Banking tab
2. Select a year (e.g., 2024)
3. Should see ship selector with routes: R001, R002, R003
4. Select a ship
5. Should see compliance balance (Surplus/Deficit)
6. Can bank surplus or apply banked credits

### Pooling Tab
1. Open Pooling tab
2. Select a year (e.g., 2024)
3. Should see table of all ships with their adjusted CB
4. Select 2+ ships
5. Validate pool configuration
6. Create pool if valid

## Database State

After running `npm run db:seed`, you should have:

**2024 Ships:**
- R001: -340.96 tonnes CO₂e (Deficit)
- R002: +263.08 tonnes CO₂e (Surplus)
- R003: -870.53 tonnes CO₂e (Deficit)

**2025 Ships:**
- R004: +27.48 tonnes CO₂e (Surplus)
- R005: -236.07 tonnes CO₂e (Deficit)
- R006: +817.92 tonnes CO₂e (Surplus)

**2026 Ships:**
- R007: -674.39 tonnes CO₂e (Deficit)
- R008: +353.95 tonnes CO₂e (Surplus)

## Next Steps

1. **Restart Backend** (if not already running): `cd backend && npm run dev`
2. **Restart Frontend**: `cd frontend && npm run dev`
3. **Test Banking Tab**: Select year → Select ship → View compliance
4. **Test Pooling Tab**: Select year → See all ships → Create pool

## Files Modified

### Backend
- `src/core/ports/IRepositories.ts` - Added `findByYear()` to `IRoutesRepository`
- `src/adapters/outbound/postgres/PrismaRoutesRepository.ts` - Implemented `findByYear()`
- `src/adapters/inbound/http/controllers/ComplianceController.ts` - Made `shipId` optional
- `src/infrastructure/server/app.ts` - Updated controller initialization
- `src/infrastructure/db/seed.ts` - Added proper calculations for all tables

### Frontend
- `src/core/domain/Banking.ts` - Added `shipId` to `ComplianceBalance`
- `src/adapters/ui/components/BankingTab.tsx` - Added ship selector and direct API fetch
