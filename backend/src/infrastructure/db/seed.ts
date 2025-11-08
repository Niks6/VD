import { PrismaClient } from '@prisma/client';
import { 
  calculateEnergy, 
  calculateComplianceBalance
} from '../../shared/calculations';

const prisma = new PrismaClient();

// Constants for calculation
const TARGET_GHG_INTENSITY = 89.3368; // gCO₂e/MJ (2% below baseline)
const ENERGY_CONVERSION_FACTOR = 41000; // MJ per tonne

/**
 * Calculate total emissions based on fuel consumption and GHG intensity
 * Formula: Total Emissions (tonnes CO₂e) = (fuelConsumption × Energy Factor × GHG Intensity) / 1,000,000
 */
function calculateTotalEmissions(fuelConsumption: number, ghgIntensity: number): number {
  const energyMJ = fuelConsumption * ENERGY_CONVERSION_FACTOR;
  const totalGCO2e = energyMJ * ghgIntensity; // gCO₂e
  return totalGCO2e / 1000000; // Convert to tonnes CO₂e
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // Seed routes data with calculated values
  const routesInput = [
    {
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      isBaseline: true,
    },
    {
      routeId: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      isBaseline: false,
    },
    {
      routeId: 'R003',
      vesselType: 'Tanker',
      fuelType: 'MGO',
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      isBaseline: false,
    },
    {
      routeId: 'R004',
      vesselType: 'RoRo',
      fuelType: 'HFO',
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      isBaseline: false,
    },
    {
      routeId: 'R005',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 90.5,
      fuelConsumption: 4950,
      distance: 11900,
      isBaseline: false,
    },
    {
      routeId: 'R006',
      vesselType: 'Tanker',
      fuelType: 'Methanol',
      year: 2025,
      ghgIntensity: 85.0,
      fuelConsumption: 4600,
      distance: 11200,
      isBaseline: false,
    },
    {
      routeId: 'R007',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2026,
      ghgIntensity: 92.5,
      fuelConsumption: 5200,
      distance: 12300,
      isBaseline: false,
    },
    {
      routeId: 'R008',
      vesselType: 'BulkCarrier',
      fuelType: 'MGO',
      year: 2026,
      ghgIntensity: 87.5,
      fuelConsumption: 4700,
      distance: 11000,
      isBaseline: false,
    },
  ];

  // Calculate and create routes with proper values
  const routes = routesInput.map(route => ({
    ...route,
    totalEmissions: calculateTotalEmissions(route.fuelConsumption, route.ghgIntensity),
  }));

  for (const route of routes) {
    await prisma.route.create({ data: route });
    console.log(`✅ Created route: ${route.routeId} | Emissions: ${route.totalEmissions.toFixed(2)} tonnes CO₂e`);
  }

  // Seed compliance data for each route with calculated values
  for (const route of routes) {
    const energy = calculateEnergy(route.fuelConsumption);
    const cb = calculateComplianceBalance(TARGET_GHG_INTENSITY, route.ghgIntensity, energy);

    await prisma.shipCompliance.create({
      data: {
        shipId: route.routeId,
        year: route.year,
        cbGco2eq: cb,
        energy,
        actual: route.ghgIntensity,
        target: TARGET_GHG_INTENSITY,
      },
    });
    
    const cbStatus = cb >= 0 ? '✅ SURPLUS' : '❌ DEFICIT';
    console.log(`✅ Created compliance for: ${route.routeId} | CB: ${(cb / 1000000).toFixed(2)} tonnes CO₂e ${cbStatus}`);
  }

  // Seed banking entries for routes with surplus (positive CB)
  console.log('\n💰 Creating banking entries...');
  for (const route of routes) {
    const energy = calculateEnergy(route.fuelConsumption);
    const cb = calculateComplianceBalance(TARGET_GHG_INTENSITY, route.ghgIntensity, energy);
    
    // Only routes with surplus can bank
    if (cb > 0) {
      // Bank 50% of surplus, keep rest for current compliance
      const bankedAmount = cb * 0.5;
      
      await prisma.bankEntry.create({
        data: {
          shipId: route.routeId,
          year: route.year,
          amountGco2eq: bankedAmount,
          applied: false,
        },
      });
      console.log(`💰 Banked for ${route.routeId}: ${(bankedAmount / 1000000).toFixed(2)} tonnes CO₂e (50% of surplus)`);
    }
  }

  // Seed pooling data - create pools for ships with deficits
  console.log('\n🏊 Creating pooling scenarios...');
  
  // Pool for 2024 - routes with deficits share with routes with surplus
  const routes2024 = routes.filter(r => r.year === 2024);
  const surplus2024Routes = [];
  const deficit2024Routes = [];
  
  for (const route of routes2024) {
    const energy = calculateEnergy(route.fuelConsumption);
    const cb = calculateComplianceBalance(TARGET_GHG_INTENSITY, route.ghgIntensity, energy);
    
    if (cb >= 0) {
      surplus2024Routes.push({ ...route, cb });
    } else {
      deficit2024Routes.push({ ...route, cb });
    }
  }
  
  if (surplus2024Routes.length > 0 && deficit2024Routes.length > 0) {
    const totalCB2024 = [...surplus2024Routes, ...deficit2024Routes].reduce((sum, r) => sum + r.cb, 0);
    const avgCBPerShip = totalCB2024 / (surplus2024Routes.length + deficit2024Routes.length);
    
    const pool2024 = await prisma.pool.create({
      data: {
        year: 2024,
        totalCb: totalCB2024,
      },
    });
    
    console.log(`🏊 Created pool for 2024 | Total CB: ${(totalCB2024 / 1000000).toFixed(2)} tonnes CO₂e`);
    
    // Create pool members
    for (const route of [...surplus2024Routes, ...deficit2024Routes]) {
      await prisma.poolMember.create({
        data: {
          poolId: pool2024.id,
          shipId: route.routeId,
          cbBefore: route.cb,
          cbAfter: avgCBPerShip,
        },
      });
      
      const improvement = ((avgCBPerShip - route.cb) / 1000000).toFixed(2);
      const sign = avgCBPerShip >= route.cb ? '+' : '';
      console.log(`   └─ ${route.routeId}: ${(route.cb / 1000000).toFixed(2)} → ${(avgCBPerShip / 1000000).toFixed(2)} tonnes CO₂e (${sign}${improvement})`);
    }
  }
  
  // Pool for 2025
  const routes2025 = routes.filter(r => r.year === 2025);
  const surplus2025Routes = [];
  const deficit2025Routes = [];
  
  for (const route of routes2025) {
    const energy = calculateEnergy(route.fuelConsumption);
    const cb = calculateComplianceBalance(TARGET_GHG_INTENSITY, route.ghgIntensity, energy);
    
    if (cb >= 0) {
      surplus2025Routes.push({ ...route, cb });
    } else {
      deficit2025Routes.push({ ...route, cb });
    }
  }
  
  if (surplus2025Routes.length > 0 && deficit2025Routes.length > 0) {
    const totalCB2025 = [...surplus2025Routes, ...deficit2025Routes].reduce((sum, r) => sum + r.cb, 0);
    const avgCBPerShip = totalCB2025 / (surplus2025Routes.length + deficit2025Routes.length);
    
    const pool2025 = await prisma.pool.create({
      data: {
        year: 2025,
        totalCb: totalCB2025,
      },
    });
    
    console.log(`🏊 Created pool for 2025 | Total CB: ${(totalCB2025 / 1000000).toFixed(2)} tonnes CO₂e`);
    
    for (const route of [...surplus2025Routes, ...deficit2025Routes]) {
      await prisma.poolMember.create({
        data: {
          poolId: pool2025.id,
          shipId: route.routeId,
          cbBefore: route.cb,
          cbAfter: avgCBPerShip,
        },
      });
      
      const improvement = ((avgCBPerShip - route.cb) / 1000000).toFixed(2);
      const sign = avgCBPerShip >= route.cb ? '+' : '';
      console.log(`   └─ ${route.routeId}: ${(route.cb / 1000000).toFixed(2)} → ${(avgCBPerShip / 1000000).toFixed(2)} tonnes CO₂e (${sign}${improvement})`);
    }
  }

  console.log('\n🎉 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
