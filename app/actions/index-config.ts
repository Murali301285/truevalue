'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getIndexConfig() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            weightRunway: 50,
            weightSentiment: 20,
            weightPipeline: 30,
        };
    }

    const config = await prisma.indexConfig.findUnique({
        where: { userId: session.user.id },
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Validate sum (optional, but good UX)
    if (data.runway + data.sentiment + data.pipeline !== 100) {
        throw new Error("Weights must sum to 100");
    }

    await prisma.indexConfig.upsert({
        where: { userId: session.user.id },
        update: {
            weightRunway: data.runway,
            weightSentiment: data.sentiment,
            weightPipeline: data.pipeline,
        },
        create: {
            userId: session.user.id,
            weightRunway: data.runway,
            weightSentiment: data.sentiment,
            weightPipeline: data.pipeline,
        },
    });

    revalidatePath("/settings/index-config");
    return { success: true };
}
