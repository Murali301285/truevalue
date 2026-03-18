"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const gateways = [
        {
            provider: "Razorpay",
            apiKey: "rzp_test_1DP5mmOlF5G5ag",
            apiSecret: "HkLxB5a8B5a8B5a8B5a8B5a8",
            validity: new Date("2026-12-31"),
            documents: ["https://sbm-assets.s3.ap-south-1.amazonaws.com/licenses/razorpay-license_2025.pdf"]
        },
        {
            provider: "Stripe",
            apiKey: "pk_test_51HG5agHG5agHG5agHG5ag",
            apiSecret: "sk_test_51HG5agHG5agHG5agHG5ag",
            validity: new Date("2027-06-30"),
            documents: []
        },
        {
            provider: "PayPal",
            apiKey: "AbC_1DP5mmOlF5G5ag_clientId",
            apiSecret: "EK_HkLxB5a8B5a8_secret",
            validity: new Date("2025-12-31"),
            documents: ["https://sbm-assets.s3.ap-south-1.amazonaws.com/licenses/paypal-agreement.pdf"]
        },
        {
            provider: "PhonePe",
            apiKey: "MERC_ID_123456",
            apiSecret: "SALT_KEY_890123",
            validity: new Date("2026-10-15"),
            documents: []
        }
    ];

    console.log("Seeding Payment Gateways...");

    for (const gw of gateways) {
        const existing = await prisma.paymentConfig.findUnique({
            where: { provider: gw.provider }
        });

        if (!existing) {
            await prisma.paymentConfig.create({
                data: {
                    provider: gw.provider,
                    apiKey: gw.apiKey,
                    apiSecret: gw.apiSecret,
                    validity: gw.validity,
                    documents: gw.documents,
                    isActive: true
                }
            });
            console.log(`Created: ${gw.provider}`);
        } else {
            console.log(`Skipped (Exists): ${gw.provider}`);
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
