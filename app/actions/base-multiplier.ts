"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBaseMultipliers() {
    try {
        const multipliers = await prisma.baseMultiplier.findMany({
            include: {
                industry: true
            },
            orderBy: {
                industry: {
                    name: 'asc'
                }
            }
        });
        return multipliers;
    } catch (error) {
        console.error("Error fetching base multipliers:", error);
        return [];
    }
}

export async function createBaseMultiplier(data: {
    industryId: string;
    revFrom: number;
    revTo: number;
    ebitdaFrom: number;
    ebitdaTo: number;
}) {
    try {
        const existing = await prisma.baseMultiplier.findUnique({
            where: { industryId: data.industryId }
        });

        if (existing) {
            return { success: false, error: "Base multiplier for this industry already exists." };
        }

        await prisma.baseMultiplier.create({
            data: {
                industryId: data.industryId,
                revMultipleFrom: data.revFrom,
                revMultipleTo: data.revTo,
                ebitdaMultipleFrom: data.ebitdaFrom,
                ebitdaMultipleTo: data.ebitdaTo,
            }
        });

        revalidatePath("/config/base-multiplier");
        return { success: true };
    } catch (error) {
        console.error("Error creating base multiplier:", error);
        return { success: false, error: "Failed to create base multiplier." };
    }
}

export async function updateBaseMultiplier(id: string, data: {
    industryId: string;
    revFrom: number;
    revTo: number;
    ebitdaFrom: number;
    ebitdaTo: number;
}) {
    try {
        // Check if industryId is being changed to an existing one
        const existing = await prisma.baseMultiplier.findUnique({
            where: { industryId: data.industryId }
        });

        if (existing && existing.id !== id) {
            return { success: false, error: "Base multiplier for this industry already exists." };
        }

        await prisma.baseMultiplier.update({
            where: { id },
            data: {
                industryId: data.industryId,
                revMultipleFrom: data.revFrom,
                revMultipleTo: data.revTo,
                ebitdaMultipleFrom: data.ebitdaFrom,
                ebitdaMultipleTo: data.ebitdaTo,
            }
        });

        revalidatePath("/config/base-multiplier");
        return { success: true };
    } catch (error) {
        console.error("Error updating base multiplier:", error);
        return { success: false, error: "Failed to update base multiplier." };
    }
}

export async function deleteBaseMultiplier(id: string) {
    try {
        await prisma.baseMultiplier.delete({
            where: { id }
        });

        revalidatePath("/config/base-multiplier");
        return { success: true };
    } catch (error) {
        console.error("Error deleting base multiplier:", error);
        return { success: false, error: "Failed to delete base multiplier." };
    }
}

export async function upsertBaseMultiplier(data: {
    industryId: string;
    revFrom: number;
    revTo: number;
    ebitdaFrom: number;
    ebitdaTo: number;
}) {
    try {
        await prisma.baseMultiplier.upsert({
            where: { industryId: data.industryId },
            update: {
                revMultipleFrom: data.revFrom,
                revMultipleTo: data.revTo,
                ebitdaMultipleFrom: data.ebitdaFrom,
                ebitdaMultipleTo: data.ebitdaTo,
            },
            create: {
                industryId: data.industryId,
                revMultipleFrom: data.revFrom,
                revMultipleTo: data.revTo,
                ebitdaMultipleFrom: data.ebitdaFrom,
                ebitdaMultipleTo: data.ebitdaTo,
            }
        });

        revalidatePath("/config/base-multiplier");
        return { success: true };
    } catch (error) {
        console.error("Error upserting base multiplier:", error);
        return { success: false, error: "Failed to save base multiplier." };
    }
}
