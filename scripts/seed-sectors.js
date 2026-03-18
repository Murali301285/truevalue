const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding missing sectors...');
  const newSectors = [
    {
      name: 'Retail',
      revMultipleFrom: 0.8,
      revMultipleTo: 1.2,
      ebitdaMultipleFrom: 4.0,
      ebitdaMultipleTo: 5.0
    },
    {
      name: 'Healthcare',
      revMultipleFrom: 1.5,
      revMultipleTo: 2.5,
      ebitdaMultipleFrom: 6.0,
      ebitdaMultipleTo: 8.0
    },
    {
      name: 'Other',
      revMultipleFrom: 1.0,
      revMultipleTo: 2.0,
      ebitdaMultipleFrom: 5.0,
      ebitdaMultipleTo: 7.0
    }
  ];

  for (const sector of newSectors) {
    const existing = await prisma.industry.findUnique({
      where: { name: sector.name }
    });

    if (!existing) {
      const created = await prisma.industry.create({
        data: {
          name: sector.name,
          status: true,
          baseMultiplier: {
            create: {
              revMultipleFrom: sector.revMultipleFrom,
              revMultipleTo: sector.revMultipleTo,
              ebitdaMultipleFrom: sector.ebitdaMultipleFrom,
              ebitdaMultipleTo: sector.ebitdaMultipleTo
            }
          }
        }
      });
      console.log(`Created sector ${sector.name}`);
    } else {
      console.log(`Sector ${sector.name} already exists`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
