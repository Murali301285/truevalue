"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Type definition based on our Prisma schema
export type PlanValuationFactorInput = {
    planName: string;
    growthLow: number;
    growthMed: number;
    growthHigh: number;
    marginLow: number;
    marginMed: number;
    marginHigh: number;
    riskHigh: number;
    riskMed: number;
    riskLow: number;
    age0to3: number;
    age3to7: number;
    age7plus: number;
};

// Fetch a single plan's factors (or return defaults if not found)
export async function getPlanValuationFactor(planName: string) {
    try {
        const record = await prisma.planValuationFactor.findUnique({
            where: { planName }
        });

        if (record) {
            return {
                planName: record.planName,
                growthLow: Number(record.growthLow),
                growthMed: Number(record.growthMed),
                growthHigh: Number(record.growthHigh),
                marginLow: Number(record.marginLow),
                marginMed: Number(record.marginMed),
                marginHigh: Number(record.marginHigh),
                riskHigh: Number(record.riskHigh),
                riskMed: Number(record.riskMed),
                riskLow: Number(record.riskLow),
                age0to3: Number(record.age0to3),
                age3to7: Number(record.age3to7),
                age7plus: Number(record.age7plus)
            };
        }

        // Return sensible defaults if not yet created in the DB
        return {
            planName,
            growthLow: 0.90,
            growthMed: 1.00,
            growthHigh: 1.15,
            marginLow: 0.90,
            marginMed: 1.00,
            marginHigh: 1.10,
            riskHigh: 0.85,
            riskMed: 1.00,
            riskLow: 1.10,
            age0to3: 0.90,
            age3to7: 1.00,
            age7plus: 1.05
        };
    } catch (error) {
        console.error("Failed to fetch plan valuation factor", error);
        throw new Error("Could not fetch configuration");
    }
}

// Upsert the configuration for a specific plan
export async function savePlanValuationFactor(data: PlanValuationFactorInput) {
    try {
        const { planName, ...factors } = data;

        await prisma.planValuationFactor.upsert({
            where: { planName },
            update: factors,
            create: {
                planName,
                ...factors
            }
        });

        revalidatePath("/config/valuation-factors");
        return { success: true };
    } catch (error) {
        console.error("Failed to save plan valuation factor", error);
        return { success: false, error: "Failed to save configuration" };
    }
}
