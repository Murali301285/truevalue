"use server";

import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { auth } from "@/auth";

export type DailyCashSummary = {
    date: Date;
    inflow: number;
    outflow: number;
    transactions: any[];
    // Platform Sales
    reportsCount: number;
    platformRevenue: number;
    reports: any[];
};

export async function getCalendarData(month: number, year: number) {
    // 0-indexed month for Date constructor
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);

    const whereClause: any = {
        date: {
            gte: start,
            lte: end,
        },
    };

    // 1. Fetch Cash Transactions (if any exist for platform)
    const cashTransactions = await prisma.cashTransaction.findMany({
        where: whereClause,
        include: {
            company: { select: { name: true } }
        },
        orderBy: { date: 'asc' }
    });

    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    // 2. Fetch Payment Transactions (Platform Sales/Reports) - Admin ONLY
    let paymentTransactions: any[] = [];
    if (isAdmin) {
        paymentTransactions = await prisma.paymentTransaction.findMany({
            where: {
                status: "success",
                createdAt: {
                    gte: start,
                    lte: end,
                }
            },
            include: {
                order: { select: { userEmail: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

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
            transactions: [],
            reportsCount: 0,
            platformRevenue: 0,
            reports: []
        };
    });

    // Populate Cash Data
    cashTransactions.forEach(tx => {
        const key = format(tx.date, "yyyy-MM-dd");
        if (grouped[key]) {
            grouped[key].transactions.push({
                ...tx,
                amount: Number(tx.amount)
            });
            if (tx.type === "INFLOW") {
                grouped[key].inflow += Number(tx.amount);
            } else {
                grouped[key].outflow += Number(tx.amount);
            }
        }
    });

    // Populate Platform Sales Data
    paymentTransactions.forEach(tx => {
        const key = format(tx.createdAt, "yyyy-MM-dd");
        if (grouped[key]) {
            // Net Amount (subtract refunds if any)
            let netAmount = Number(tx.amount);
            if (tx.isRefunded) {
                 netAmount = 0; // Or handle refunds differently if desired
            }

            if (netAmount > 0) {
                grouped[key].reportsCount += 1;
                grouped[key].platformRevenue += netAmount;
                grouped[key].reports.push({
                    ...tx,
                    amount: Number(tx.amount)
                });
            }
        }
    });

    return Object.values(grouped);
}
