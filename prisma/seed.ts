import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Starting master configuration seed...");

  // 1. Industries
  const industries = ["Technology", "Manufacturing", "Retail", "Healthcare", "Services"];
  for (const name of industries) {
    await prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name, remarks: "Default industry", status: true },
    });
  }
  console.log("✅ Industries seeded");

  // 2. Base Multipliers (For the industries above)
  const allIndustries = await prisma.industry.findMany();
  for (const ind of allIndustries) {
    const existing = await prisma.baseMultiplier.findUnique({
      where: { industryId: ind.id }
    });
    if (!existing) {
      await prisma.baseMultiplier.create({
        data: {
          industryId: ind.id,
          revMultipleFrom: 1.0,
          revMultipleTo: 3.0,
          ebitdaMultipleFrom: 5.0,
          ebitdaMultipleTo: 8.0,
        }
      });
    }
  }
  console.log("✅ Base Multipliers seeded");

  // 3. Pricing Plans
  const plans = [
    { name: "Express", price: 499, taxPercentage: 18, features: ["Instant Report", "PDF Download", "Basic Multiples"] },
    { name: "Standard", price: 2999, taxPercentage: 18, features: ["Detailed DCF", "Peer Comparison", "Analyst Support"] },
    { name: "Certified", price: 9999, taxPercentage: 18, features: ["ICAI Certified", "Signed Report", "1-on-1 Call"] }
  ];

  for (const plan of plans) {
    const priceNum = Number(plan.price);
    const taxNum = Number(plan.taxPercentage);
    const total = priceNum + (priceNum * (taxNum / 100));

    await prisma.pricingPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        price: plan.price,
        taxPercentage: plan.taxPercentage,
        totalPrice: total,
        currency: "INR",
        features: plan.features,
        isActive: true,
      }
    });
  }
  console.log("✅ Pricing Plans seeded");

  // 4. Plan Valuation Factors
  for (const plan of plans) {
    await prisma.planValuationFactor.upsert({
      where: { planName: plan.name },
      update: {},
      create: {
        planName: plan.name,
        growthLow: 0.90, growthMed: 1.00, growthHigh: 1.15,
        marginLow: 0.90, marginMed: 1.00, marginHigh: 1.10,
        riskHigh: 0.85, riskMed: 1.00, riskLow: 1.10,
        age0to3: 0.90, age3to7: 1.00, age7plus: 1.05
      }
    });
  }
  console.log("✅ Valuation Factors seeded");

  // 5. Promotional Offers (Default 10% OFF)
  const validTill = new Date();
  validTill.setFullYear(validTill.getFullYear() + 1); // Valid for 1 year
  
  await prisma.offerCode.upsert({
    where: { code: "NEW10" },
    update: {},
    create: {
      code: "NEW10",
      offerValue: 10,
      type: "percentage",
      validTill: validTill,
      frequency: "multiple",
      applicablePlans: [], // All plans
      isActive: true
    }
  });
  console.log("✅ Promotional Offers seeded");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
