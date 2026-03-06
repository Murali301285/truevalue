'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// TODO: Replace with actual session fetching when Auth is fully wired
const DEMO_USER_ID = "demo-parent-id";

export async function getIndexConfig() {
    // Ensure we have a demo user for this phase if not exists
    let user = await prisma.user.findUnique({ where: { email: "demo@realsme.com" } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "demo@realsme.com",
                name: "Demo Parent",
                role: "USER",
                id: DEMO_USER_ID
            }
        });
    }

    const config = await prisma.indexConfig.findUnique({
        where: { userId: user.id },
    });

    if (!config) {
        // Return default values if not found
        return {
            weightRunway: 50,
            weightSentiment: 20,
            weightPipeline: 30,
        };
    }

    return {
        weightRunway: config.weightRunway,
        weightSentiment: config.weightSentiment,
        weightPipeline: config.weightPipeline,
    };
}

export async function updateIndexConfig(data: {
    runway: number;
    sentiment: number;
    pipeline: number;
}) {
    const user = await prisma.user.findUnique({ where: { email: "demo@realsme.com" } });
    if (!user) throw new Error("User not found");

    // Validate sum (optional, but good UX)
    if (data.runway + data.sentiment + data.pipeline !== 100) {
        throw new Error("Weights must sum to 100");
    }

    await prisma.indexConfig.upsert({
        where: { userId: user.id },
        update: {
            weightRunway: data.runway,
            weightSentiment: data.sentiment,
            weightPipeline: data.pipeline,
        },
        create: {
            userId: user.id,
            weightRunway: data.runway,
            weightSentiment: data.sentiment,
            weightPipeline: data.pipeline,
        },
    });

    revalidatePath("/settings/index-config");
    return { success: true };
}
