const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function exportData() {
  const industries = await prisma.industry.findMany();
  const pricingPlans = await prisma.pricingPlan.findMany();
  const valuationFactors = await prisma.planValuationFactor.findMany();
  const baseMultipliers = await prisma.baseMultiplier.findMany();
  const paymentConfigs = await prisma.paymentConfig.findMany();
  const offerCodes = await prisma.offerCode.findMany();
  
  fs.writeFileSync('export.json', JSON.stringify({
    industries,
    pricingPlans,
    valuationFactors,
    baseMultipliers,
    paymentConfigs,
    offerCodes
  }, null, 2));
  console.log("Export successful");
}

exportData().catch(console.error).finally(() => prisma.$disconnect());
