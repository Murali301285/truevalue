"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const plans = [
        {
            name: "Express",
            price: 7999,
            currency: "INR",
            features: [
                "Basic Valuation Report",
                "Financial Health Check",
                "Email Support"
            ]
        },
        {
            name: "Standard",
            price: 14999,
            currency: "INR",
            features: [
                "Comprehensive Valuation",
                "Detailed Financial Analysis",
                "Competitor Benchmarking",
                "Priority Email Support"
            ]
        },
        {
            name: "Certified",
            price: 24999,
            currency: "INR",
            features: [
                "Certified Valuation Report",
                "Investment Readiness Score",
                "Investor Pitch Deck Review",
                "Dedicated Account Manager",
                "24/7 Support"
            ]
        },
        {
            name: "Enterprise",
            price: 49999,
            currency: "INR",
            features: [
                "Custom Valuation Models",
                "M&A Advisory Support",
                "API Access",
                "White labeling",
                "On-premise deployment option"
            ]
        }

    ];

    console.log("Seeding Pricing Plans...");

    for (const plan of plans) {
        const existing = await prisma.pricingPlan.findUnique({
            where: { name: plan.name }
        });

        if (!existing) {
            await prisma.pricingPlan.create({
                data: {
                    name: plan.name,
                    price: plan.price,
                    currency: plan.currency,
                    features: plan.features,
                    isActive: true
                }
            });
            console.log(`Created: ${plan.name}`);
        } else {
            console.log(`Skipped (Exists): ${plan.name}`);
        }
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
