'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TransactionSchema = z.object({
    companyId: z.string(),
    type: z.enum(["INFLOW", "OUTFLOW"]),
    amount: z.coerce.number().positive(),
    date: z.string(), // ISO Date
    category: z.string(),
    description: z.string().optional(),
    isRecurring: z.boolean().default(false),
    frequency: z.enum(["ONETIME", "DAILY", "WEEKLY", "MONTHLY"]).default("ONETIME"),
});

export async function logTransaction(prevState: any, formData: FormData) {
    const rawData = {
        companyId: formData.get("companyId"),
        type: formData.get("type"),
        amount: formData.get("amount"),
        date: formData.get("date"),
        category: formData.get("category"),
        description: formData.get("description"),
        isRecurring: formData.get("isRecurring") === "on",
        frequency: formData.get("frequency") || "ONETIME",
    };

    try {
        const data = TransactionSchema.parse(rawData);

        // Create Transaction
        await prisma.cashTransaction.create({
            data: {
                companyId: data.companyId,
                type: data.type as any,
                amount: data.amount,
                date: new Date(data.date),
                category: data.category,
                description: data.description,
                isRecurring: data.isRecurring,
                frequency: data.frequency as any,
            }
        });

        // Update Company Aggregates (Simple logic for now)
        // In a real app, you might re-calculate this asynchronously
        const isInflow = data.type === "INFLOW";
        if (isInflow) {
            await prisma.company.update({
                where: { id: data.companyId },
                data: {
                    // We're not tracking a simple balance field in schema yet, 
                    // but usually we'd update `currentBalance`.
                    // For this demo, we just log the transaction.
                }
            });
        }

        revalidatePath(`/company/${data.companyId}`);
        return { success: true, message: "Transaction Logged Successfully" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Failed to log transaction" };
    }
}

export async function getTransactions(companyId: string) {
    return await prisma.cashTransaction.findMany({
        where: { companyId },
        orderBy: { date: 'desc' },
        take: 20,
    });
}

export async function bulkImportTransactions(data: any[]) {
    try {
        const validTransactions = [];
        const errors = [];

        // 1. Fetch all companies to map Name -> ID if needed
        const companies = await prisma.company.findMany({ select: { id: true, name: true, code: true } });

        for (const item of data) {
            // Flexible matching for Company
            let companyId = item.companyId;
            if (!companyId && item.companyName) {
                const match = companies.find(c =>
                    c.name.toLowerCase() === item.companyName.toLowerCase() ||
                    c.code?.toLowerCase() === item.companyName.toLowerCase()
                );
                if (match) companyId = match.id;
            }

            if (!companyId) {
                errors.push({ row: item, error: "Company not found" });
                continue;
            }

            // Clean amounts (remove currency symbols)
            let amount = item.amount;
            if (typeof amount === 'string') {
                amount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
            }

            // Validate
            const result = TransactionSchema.safeParse({
                companyId,
                type: item.type?.toUpperCase() || "OUTFLOW",
                amount: Number(amount),
                date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                category: item.category || "other",
                description: item.description || "Imported Transaction",
                isRecurring: false,
                frequency: "ONETIME"
            });

            if (result.success) {
                validTransactions.push(result.data);
            } else {
                errors.push({ row: item, error: result.error.issues[0]?.message || "Validation failed" });
            }
        }

        if (validTransactions.length > 0) {
            await prisma.cashTransaction.createMany({
                data: validTransactions.map(t => ({
                    ...t,
                    date: new Date(t.date),
                    type: t.type as any,
                    frequency: t.frequency as any
                }))
            });
        }

        revalidatePath('/cash-flow');
        return {
            success: true,
            count: validTransactions.length,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (e) {
        console.error("Bulk Import Error", e);
        return { success: false, message: "Failed to process import" };
    }
}
