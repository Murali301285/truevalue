"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required.");
    }
}

export async function getIndustries() {
    try {
        const industries = await prisma.industry.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return industries;
    } catch (error) {
        console.error("Error fetching industries:", error);
        return [];
    }
}

export async function createIndustry(data: { name: string; remarks?: string }) {
    try {
        await requireAdmin();
        const existing = await prisma.industry.findUnique({
            where: { name: data.name }
        });

        if (existing) {
            return { success: false, error: "Industry already exists." };
        }

        await prisma.industry.create({
            data: {
                name: data.name,
                remarks: data.remarks,
                status: true
            }
        });

        revalidatePath("/config/industry");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating industry:", error);
        return { success: false, error: error.message || "Failed to create industry." };
    }
}

export async function updateIndustry(id: string, data: { name: string; remarks?: string, status?: boolean }) {
    try {
        await requireAdmin();
        await prisma.industry.update({
            where: { id },
            data: {
                name: data.name,
                remarks: data.remarks,
                status: data.status
            }
        });

        revalidatePath("/config/industry");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating industry:", error);
        return { success: false, error: error.message || "Failed to update industry." };
    }
}

export async function deleteIndustry(id: string) {
    try {
        await requireAdmin();
        await prisma.industry.delete({
            where: { id }
        });

        revalidatePath("/config/industry");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting industry:", error);
        return { success: false, error: error.message || "Failed to delete industry." };
    }
}

export async function toggleIndustryStatus(id: string, currentStatus: boolean) {
    try {
        await requireAdmin();
        await prisma.industry.update({
            where: { id },
            data: { status: !currentStatus }
        });

        revalidatePath("/config/industry");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling status:", error);
        return { success: false, error: error.message || "Failed to update status." };
    }
}
