"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPricingPlans() {
    try {
        const plans = await prisma.pricingPlan.findMany({
            orderBy: { price: 'asc' }
        });
        // Convert Decimal to string/number for serialization if needed, 
        // but Prisma usually handles simple Decimals fine in Next.js server actions now, 
        // or we map them.
        return plans.map(p => ({
            ...p,
            price: p.price.toNumber()
        }));
    } catch (error) {
        console.error("Error fetching pricing plans:", error);
        return [];
    }
}

export async function createPricingPlan(data: { name: string; price: number; currency?: string; features: string[] }) {
    try {
        await prisma.pricingPlan.create({
            data: {
                name: data.name,
                price: data.price,
                currency: data.currency || "INR",
                features: data.features,
                isActive: true
            }
        });

        revalidatePath("/config/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error creating pricing plan:", error);
        return { success: false, error: "Failed to create pricing plan." };
    }
}

export async function updatePricingPlan(id: string, data: { name: string; price: number; currency?: string; features: string[], isActive?: boolean }) {
    try {
        await prisma.pricingPlan.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                currency: data.currency,
                features: data.features,
                isActive: data.isActive
            }
        });

        revalidatePath("/config/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error updating pricing plan:", error);
        return { success: false, error: "Failed to update pricing plan." };
    }
}

export async function deletePricingPlan(id: string) {
    try {
        await prisma.pricingPlan.delete({
            where: { id }
        });

        revalidatePath("/config/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error deleting pricing plan:", error);
        return { success: false, error: "Failed to delete pricing plan." };
    }
}

export async function togglePricingPlanStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.pricingPlan.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath("/config/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error toggling status:", error);
        return { success: false, error: "Failed to update status." };
    }
}
