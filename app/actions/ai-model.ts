"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAiModels() {
    try {
        const models = await prisma.aiModelConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return models;
    } catch (error) {
        console.error("Error fetching AI models:", error);
        return [];
    }
}

export async function upsertAiModel(data: {
    id?: string;
    name: string;
    apiKey: string;
    validity?: Date;
    usedFor?: string;
    remarks?: string;
}) {
    try {
        if (data.id) {
            await prisma.aiModelConfig.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    apiKey: data.apiKey,
                    validity: data.validity,
                    usedFor: data.usedFor,
                    remarks: data.remarks
                }
            });
        } else {
            const existing = await prisma.aiModelConfig.findUnique({
                where: { name: data.name }
            });

            if (existing) {
                return { success: false, error: "Model with this name already exists." };
            }

            await prisma.aiModelConfig.create({
                data: {
                    name: data.name,
                    apiKey: data.apiKey,
                    validity: data.validity,
                    usedFor: data.usedFor,
                    remarks: data.remarks,
                    isActive: true
                }
            });
        }

        revalidatePath("/config/ai-model");
        return { success: true };
    } catch (error) {
        console.error("Error saving AI model:", error);
        return { success: false, error: "Failed to save AI model." };
    }
}

export async function deleteAiModel(id: string) {
    try {
        await prisma.aiModelConfig.delete({
            where: { id }
        });

        revalidatePath("/config/ai-model");
        return { success: true };
    } catch (error) {
        console.error("Error deleting AI model:", error);
        return { success: false, error: "Failed to delete AI model." };
    }
}

export async function toggleAiModelStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.aiModelConfig.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath("/config/ai-model");
        return { success: true };
    } catch (error) {
        console.error("Error toggling status:", error);
        return { success: false, error: "Failed to update status." };
    }
}
