'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getCompanies() {
    return await prisma.company.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createCompany(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: User not found." };
        }

        await prisma.company.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                industry: data.industry,
                startedOn: data.startedOn ? new Date(data.startedOn) : null,
                address: data.address,
                gstNo: data.gstNo,
                logoUrl: data.logoUrl,
                statutoryDoc: data.statutoryDoc,
                management: data.management || [],
                parentId: session.user.id,
            }
        });
        revalidatePath('/config/company');
        return { success: true };
    } catch (error: any) {
        console.error("Create Company Error:", error);
        if (error.code === 'P2002') {
            // Check which field caused the violation if possible, or just generic
            const target = error.meta?.target?.[0] || 'Field';
            return { success: false, error: `${target} already exists. Please use a unique value.` };
        }
        return { success: false, error: "Failed to create company. " + (error.message || "") };
    }
}

export async function updateCompany(id: string, data: any) {
    try {
        await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                industry: data.industry,
                startedOn: data.startedOn ? new Date(data.startedOn) : null,
                address: data.address,
                gstNo: data.gstNo,
                logoUrl: data.logoUrl,
                statutoryDoc: data.statutoryDoc,
                management: data.management || [],
            }
        });
        revalidatePath('/config/company');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update company." };
    }
}

export async function deleteCompany(id: string) {
    try {
        await prisma.company.delete({ where: { id } });
        revalidatePath('/config/company');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete company." };
    }
}
