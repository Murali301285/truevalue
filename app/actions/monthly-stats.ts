'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper to serialize Decimal to number for UI
const serializeDecimal = (obj: any) => {
    if (!obj) return obj;
    const newObj = { ...obj };
    const decimalFields = [
        'debtors0to30', 'debtors31to60', 'debtors61to90', 'debtors90plus',
        'creditors0to30', 'creditors31to60', 'creditors61to90', 'creditors90plus',
        'cashOnHand', 'cashAtBank', 'stockValue'
    ];

    decimalFields.forEach(field => {
        if (newObj[field] && typeof newObj[field] === 'object' && 'toNumber' in newObj[field]) {
            newObj[field] = newObj[field].toNumber();
        } else if (newObj[field] && typeof newObj[field] === 'object' && !('toNumber' in newObj[field])) {
            newObj[field] = Number(newObj[field]);
        }
    });
    return newObj;
}

export async function getMonthlyStat(companyId: string, month: number, year: number) {
    try {
        const stat = await prisma.monthlyStat.findUnique({
            where: {
                companyId_month_year: {
                    companyId,
                    month,
                    year
                }
            }
        });
        return { success: true, data: serializeDecimal(stat) };
    } catch (error) {
        console.error("Get Monthly Stat Error:", error);
        return { success: false, error: "Failed to fetch monthly data." };
    }
}

export async function upsertMonthlyStat(data: any) {
    try {
        await prisma.monthlyStat.upsert({
            where: {
                companyId_month_year: {
                    companyId: data.companyId,
                    month: data.month,
                    year: data.year
                }
            },
            update: {
                debtors0to30: data.debtors0to30,
                debtors31to60: data.debtors31to60,
                debtors61to90: data.debtors61to90,
                debtors90plus: data.debtors90plus,
                creditors0to30: data.creditors0to30,
                creditors31to60: data.creditors31to60,
                creditors61to90: data.creditors61to90,
                creditors90plus: data.creditors90plus,
                cashOnHand: data.cashOnHand,
                cashAtBank: data.cashAtBank,
                stockValue: data.stockValue,
                top5Expenses: data.top5Expenses,
                assetCondition: data.assetCondition,
                attendanceAvg: data.attendanceAvg,
                attendanceNote: data.attendanceNote,
                bdActivities: data.bdActivities
            },
            create: {
                companyId: data.companyId,
                month: data.month,
                year: data.year,
                debtors0to30: data.debtors0to30,
                debtors31to60: data.debtors31to60,
                debtors61to90: data.debtors61to90,
                debtors90plus: data.debtors90plus,
                creditors0to30: data.creditors0to30,
                creditors31to60: data.creditors31to60,
                creditors61to90: data.creditors61to90,
                creditors90plus: data.creditors90plus,
                cashOnHand: data.cashOnHand,
                cashAtBank: data.cashAtBank,
                stockValue: data.stockValue,
                top5Expenses: data.top5Expenses || [],
                assetCondition: data.assetCondition,
                attendanceAvg: data.attendanceAvg,
                attendanceNote: data.attendanceNote,
                bdActivities: data.bdActivities
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Upsert Monthly Stat Error:", error);
        return { success: false, error: "Failed to save monthly data." };
    }
}
