"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const models = [
        {
            name: "GPT-4",
            apiKey: "sk-proj-1234567890abcdef1234567890abcdef",
            validity: new Date("2026-12-31"),
            usedFor: "Complex reasoning, report generation",
            remarks: "Primary model for detailed analysis"
        },
        {
            name: "Claude 3.5 Sonnet",
            apiKey: "sk-ant-api03-1234567890abcdef1234567890abcdef",
            validity: new Date("2026-06-30"),
            usedFor: "Code generation, creative writing",
            remarks: "Backup model, good for large context"
        },
        {
            name: "DALL-E 3",
            apiKey: "sk-proj-image-gen-key-12345",
            validity: new Date("2025-12-31"),
            usedFor: "Image generation",
            remarks: "Used for report cover images"
        },
        {
            name: "Gemini 1.5 Pro",
            apiKey: "AIzaSyD-1234567890abcdef1234567890abcdef",
            validity: new Date("2027-01-01"),
            usedFor: "Multimodal analysis",
            remarks: "Testing phase"
        }
    ];

    console.log("Seeding AI Models...");

    for (const model of models) {
        const existing = await prisma.aiModelConfig.findUnique({
            where: { name: model.name }
        });

        if (!existing) {
            await prisma.aiModelConfig.create({
                data: {
                    name: model.name,
                    apiKey: model.apiKey,
                    validity: model.validity,
                    usedFor: model.usedFor,
                    remarks: model.remarks,
                    isActive: true
                }
            });
            console.log(`Created: ${model.name}`);
        } else {
            console.log(`Skipped (Exists): ${model.name}`);
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
