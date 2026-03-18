"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPaymentConfigs() {
    try {
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
    } catch (error) {
        console.error("Error saving payment config:", error);
        return { success: false, error: "Failed to save configuration." };
    }
}

export async function deletePaymentConfig(id: string) {
    try {
        await prisma.paymentConfig.delete({
            where: { id }
        });

        revalidatePath("/config/payment");
        return { success: true };
    } catch (error) {
        console.error("Error deleting payment config:", error);
        return { success: false, error: "Failed to delete configuration." };
    }
}

export async function togglePaymentConfigStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.paymentConfig.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath("/config/payment");
        return { success: true };
    } catch (error) {
        console.error("Error toggling status:", error);
        return { success: false, error: "Failed to update status." };
    }
}
