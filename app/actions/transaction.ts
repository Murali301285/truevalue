'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required.");
    }
}

export async function getGlobalTransactions() {
    try {
        await requireAdmin();
        const transactions = await prisma.cashTransaction.findMany({
            include: {
                company: {
                    select: {
                        name: true,
                        code: true,
                        logoUrl: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Transform for UI if needed, but returning raw is fine for now
        return transactions;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
    }
}

export async function deleteTransaction(id: string) {
    try {
        await requireAdmin();
        await prisma.cashTransaction.delete({
            where: { id }
        });
        revalidatePath('/cash-flow');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}
