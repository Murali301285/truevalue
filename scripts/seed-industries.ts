"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const industries = [
        { name: "Manufacturing", remarks: "General manufacturing sector" },
        { name: "Information Technology", remarks: "Software and IT services" },
        { name: "Healthcare & Pharma", remarks: "Hospitals, clinics, and pharmaceutical companies" },
        { name: "Retail & Trading", remarks: "Wholesale and retail businesses" },
        { name: "Construction & Real Estate", remarks: "Infrastructure and housing projects" },
        { name: "Logistics & Supply Chain", remarks: "Transport and warehousing" },
        { name: "Textiles & Apparels", remarks: "Garment manufacturing and trading" },
        { name: "Food & Beverage", remarks: "Restaurants and food processing" },
        { name: "Automotive", remarks: "Auto parts and dealerships" },
        { name: "Education", remarks: "Schools and coaching institutes" },
    ];

    console.log("Seeding Industries...");

    for (const ind of industries) {
        const existing = await prisma.industry.findUnique({
            where: { name: ind.name }
        });

        if (!existing) {
            await prisma.industry.create({
                data: {
                    name: ind.name,
                    remarks: ind.remarks,
                    status: true
                }
            });
            console.log(`Created: ${ind.name}`);
        } else {
            console.log(`Skipped (Exists): ${ind.name}`);
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
