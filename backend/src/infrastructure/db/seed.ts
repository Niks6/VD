import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // Seed routes data
  const routes = [
    {
      routeId: 'ROUTE-001',
      vesselType: 'Container Ship',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 95.5,
      fuelConsumption: 1200,
      distance: 25000,
      totalEmissions: 3800,
      isBaseline: true,
    },
    {
      routeId: 'ROUTE-002',
      vesselType: 'Bulk Carrier',
      fuelType: 'VLSFO',
      year: 2024,
      ghgIntensity: 88.2,
      fuelConsumption: 950,
      distance: 18000,
      totalEmissions: 2850,
      isBaseline: false,
    },
    {
      routeId: 'ROUTE-003',
      vesselType: 'Tanker',
      fuelType: 'MDO',
      year: 2024,
      ghgIntensity: 92.8,
      fuelConsumption: 1100,
      distance: 22000,
      totalEmissions: 3500,
      isBaseline: false,
    },
    {
      routeId: 'ROUTE-004',
      vesselType: 'Container Ship',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 82.5,
      fuelConsumption: 800,
      distance: 20000,
      totalEmissions: 2200,
      isBaseline: false,
    },
    {
      routeId: 'ROUTE-005',
      vesselType: 'Ro-Ro',
      fuelType: 'MGO',
      year: 2024,
      ghgIntensity: 90.1,
      fuelConsumption: 650,
      distance: 15000,
      totalEmissions: 1950,
      isBaseline: false,
    },
  ];

  for (const route of routes) {
    await prisma.route.create({ data: route });
    console.log(`✅ Created route: ${route.routeId}`);
  }

  // Seed compliance data for each route
  for (const route of routes) {
    const energy = route.fuelConsumption * 41000; // MJ
    const target = 89.3368; // gCO₂e/MJ
    const cb = (target - route.ghgIntensity) * energy;

    await prisma.shipCompliance.create({
      data: {
        shipId: route.routeId,
        year: route.year,
        cbGco2eq: cb,
        energy,
        actual: route.ghgIntensity,
        target,
      },
    });
    console.log(`✅ Created compliance for: ${route.routeId} (CB: ${cb.toFixed(2)})`);
  }

  console.log('🎉 Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
