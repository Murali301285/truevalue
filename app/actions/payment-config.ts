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

export async function getPaymentConfigs() {
    try {
        await requireAdmin();
        const configs = await prisma.paymentConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return configs;
    } catch (error) {
        console.error("Error fetching payment configs:", error);
        return [];
    }
}

export async function upsertPaymentConfig(data: {
    id?: string;
    provider: string;
    apiKey: string;
    apiSecret: string;
    validity?: Date;
    documents?: string[];
}) {
    try {
        await requireAdmin();
        if (data.id) {
            await prisma.paymentConfig.update({
                where: { id: data.id },
                data: {
                    provider: data.provider,
                    apiKey: data.apiKey,
                    apiSecret: data.apiSecret,
                    validity: data.validity,
                    documents: data.documents
                }
            });
        } else {
            // Check for existing provider to ensure uniqueness if not caught by UI
            const existing = await prisma.paymentConfig.findUnique({
                where: { provider: data.provider }
            });

            if (existing) {
                return { success: false, error: "Configuration for this provider already exists." };
            }

            await prisma.paymentConfig.create({
                data: {
                    provider: data.provider,
                    apiKey: data.apiKey,
                    apiSecret: data.apiSecret,
                    validity: data.validity,
                    documents: data.documents,
                    isActive: true
                }
            });
        }

        revalidatePath("/config/payment");
        return { success: true };
    } catch (error: any) {
        console.error("Error saving payment config:", error);
        return { success: false, error: error.message || "Failed to save configuration." };
    }
}

export async function deletePaymentConfig(id: string) {
    try {
        await requireAdmin();
        await prisma.paymentConfig.delete({
            where: { id }
        });

        revalidatePath("/config/payment");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting payment config:", error);
        return { success: false, error: error.message || "Failed to delete configuration." };
    }
}

export async function togglePaymentConfigStatus(id: string, currentStatus: boolean) {
    try {
        await requireAdmin();
        await prisma.paymentConfig.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath("/config/payment");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling status:", error);
        return { success: false, error: error.message || "Failed to update status." };
    }
}
