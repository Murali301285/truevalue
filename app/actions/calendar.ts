'use server';

import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export type DailyCashSummary = {
    date: Date;
    inflow: number;
    outflow: number;
    transactions: any[];
};

export async function getCalendarData(month: number, year: number, companyId?: string) {
    // 0-indexed month for Date constructor
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);

    const whereClause: any = {
        date: {
            gte: start,
            lte: end,
        },
    };

    if (companyId && companyId !== "ALL") {
        whereClause.companyId = companyId;
    }

    const transactions = await prisma.cashTransaction.findMany({
        where: whereClause,
        include: {
            company: { select: { name: true } }
        },
        orderBy: { date: 'asc' }
    });

    // Group by Date
    const grouped: Record<string, DailyCashSummary> = {};

    // Initialize all days
    const days = eachDayOfInterval({ start, end });
    days.forEach(day => {
        const key = format(day, "yyyy-MM-dd");
        grouped[key] = {
            date: day,
            inflow: 0,
            outflow: 0,
            transactions: []
        };
    });

    // Populate data
    transactions.forEach(tx => {
        const key = format(tx.date, "yyyy-MM-dd");
        if (grouped[key]) {
            grouped[key].transactions.push(tx);
            if (tx.type === "INFLOW") {
                grouped[key].inflow += Number(tx.amount);
            } else {
                grouped[key].outflow += Number(tx.amount);
            }
        }
    });

    return Object.values(grouped);
}
