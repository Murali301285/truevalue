'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper to serialize Decimal to number (or string if preferred, but UI expects number)
const serializeDecimal = (obj: any) => {
    if (!obj) return obj;
    const newObj = { ...obj };
    ['cashInflow', 'cashOutflow', 'newOrders', 'receivables', 'receivablesCollected', 'cashShortageAmount'].forEach(field => {
        if (newObj[field] && typeof newObj[field] === 'object' && 'toNumber' in newObj[field]) {
            newObj[field] = newObj[field].toNumber();
        } else if (newObj[field] && typeof newObj[field] === 'object' && !('toNumber' in newObj[field])) /* Decimal-like from raw query or other source */ {
            // If it's a Decimal object but lost prototype, or standard JSON object
            newObj[field] = Number(newObj[field]);
        }
    });
    return newObj;
}

// Upsert Weekly Stat (Create or Update based on company+week)
export async function upsertWeeklyStat(data: any) {
    try {
        const weekDate = new Date(data.weekEnding);

        await prisma.weeklyStat.upsert({
            where: {
                companyId_weekEnding: {
                    companyId: data.companyId,
                    weekEnding: weekDate
                }
            },
            update: {
                cashInflow: data.cashInflow,
                cashOutflow: data.cashOutflow,
                newOrders: data.newOrders,
                newCustomers: data.newCustomers,
                receivables: data.receivables, // Closing Balance
                receivablesCollected: data.receivablesCollected,
                pipelineStatus: data.pipelineStatus, // 'LOW' | 'NORMAL' | 'GOOD'
                sentiment: 5, // Default for now
                assetUtilisation: data.assetUtilisation,
                majorChallenges: data.majorChallenges,
                cashShortageRisk: data.cashShortageRisk,
                cashShortageAmount: data.cashShortageAmount,
                peopleChanges: data.peopleChanges // JSON
            },
            create: {
                companyId: data.companyId,
                weekEnding: weekDate,
                cashInflow: data.cashInflow,
                cashOutflow: data.cashOutflow,
                newOrders: data.newOrders,
                newCustomers: data.newCustomers,
                receivables: data.receivables,
                receivablesCollected: data.receivablesCollected,
                pipelineStatus: data.pipelineStatus,
                assetUtilisation: data.assetUtilisation,
                majorChallenges: data.majorChallenges,
                cashShortageRisk: data.cashShortageRisk,
                cashShortageAmount: data.cashShortageAmount,
                peopleChanges: data.peopleChanges
            }
        });

        revalidatePath('/cash-flow');
        return { success: true };
    } catch (error) {
        console.error("Upsert Weekly Stat Error:", error);
        return { success: false, error: "Failed to save weekly health update." };
    }
}

// Get stat for a specific week
export async function getWeeklyStat(companyId: string, dateStr: string) {
    try {
        const date = new Date(dateStr);
        const stat = await prisma.weeklyStat.findUnique({
            where: {
                companyId_weekEnding: {
                    companyId: companyId,
                    weekEnding: date
                }
            }
        });
        return { success: true, data: serializeDecimal(stat) };
    } catch (error) {
        console.error("Get Weekly Stat Error:", error);
        return { success: false, error: "Failed to fetch data." };
    }
}

// Get previous week's stat (to find opening balances)
export async function getPreviousWeekStat(companyId: string, currentWeekDateStr: string) {
    try {
        const currentDate = new Date(currentWeekDateStr);
        // Find the most recent record before this date
        const prevStat = await prisma.weeklyStat.findFirst({
            where: {
                companyId: companyId,
                weekEnding: {
                    lt: currentDate
                }
            },
            orderBy: {
                weekEnding: 'desc'
            }
        });
        return { success: true, data: serializeDecimal(prevStat) };
    } catch (error) {
        console.error("Get Prev Weekly Stat Error:", error);
        return { success: false, error: "Could not fetch previous data." };
    }
}

// Get historical stats for analytics (with filters)
export async function getWeeklyStatsHistory({
    companyId,
    fromDate,
    toDate
}: {
    companyId: string;
    fromDate?: Date;
    toDate?: Date;
}) {
    try {
        const whereClause: any = {};

        // 1. Company Filter
        if (companyId && companyId !== 'ALL') {
            whereClause.companyId = companyId;
        }

        // 2. Date Range Filter
        if (fromDate || toDate) {
            whereClause.weekEnding = {};
            if (fromDate) whereClause.weekEnding.gte = fromDate;
            if (toDate) whereClause.weekEnding.lte = toDate;
        }

        const stats = await prisma.weeklyStat.findMany({
            where: whereClause,
            include: {
                company: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            },
            orderBy: {
                weekEnding: 'desc'
            }
        });

        // Serialize Decimals
        const serializedStats = stats.map(stat => ({
            ...serializeDecimal(stat),
            companyName: stat.company.name
        }));

        return { success: true, data: serializedStats };
    } catch (error) {
        console.error("Get Weekly Stats History Error:", error);
        return { success: false, error: "Failed to fetch historical data." };
    }
}

// Get the very latest stat for a company
export async function getLatestWeeklyStat(companyId: string) {
    try {
        const stat = await prisma.weeklyStat.findFirst({
            where: { companyId },
            orderBy: { weekEnding: 'desc' }
        });
        return { success: true, data: serializeDecimal(stat) };
    } catch (error) {
        return { success: false, error: "Failed to fetch latest data." };
    }
}
