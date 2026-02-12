'use server';

import { prisma } from "@/lib/db";
import { calculateRealSMEIndex, calculateRunwayDays, PipelineStatus } from "@/lib/logic";
import { CompanyHealthData } from "@/types/dashboard";

export async function getPortfolioHealth(): Promise<{ success: boolean; data?: CompanyHealthData[]; error?: string }> {
    try {
        // Fetch companies with latest stats
        const companies = await prisma.company.findMany({
            include: {
                weeklyStats: {
                    orderBy: { weekEnding: 'desc' },
                    take: 6 // Take 6 for trend
                },
                monthlyStats: {
                    orderBy: [{ year: 'desc' }, { month: 'desc' }],
                    take: 1
                }
            }
        });

        const dashboardData: CompanyHealthData[] = companies.map(comp => {
            const latestWeekly = comp.weeklyStats[0];
            const latestMonthly = comp.monthlyStats[0];

            // 1. Determine Cash Balance
            // Prefer Monthly (verified) over Weekly (estimated), or use latest date
            // For now, let's sum Monthly Liquidity if available, else Weekly 'CashInflow - Outflow' accumulation? 
            // Better: 'WeeklyStat' doesn't track balance, only flow. 
            // So we MUST use MonthlyStat for accurate Balance.
            // Fallback: If no monthly, returns 0.
            const cashBalance = latestMonthly
                ? (Number(latestMonthly.cashOnHand) + Number(latestMonthly.cashAtBank))
                : 0;

            // 2. Determine Burn Rate (Monthly)
            // Use latest Weekly Outflow * 4 as proxy
            const weeklyBurn = latestWeekly ? Number(latestWeekly.cashOutflow) : 0;
            const monthlyBurnRate = weeklyBurn * 4;

            // 3. Runway
            const runwayDays = calculateRunwayDays(cashBalance, monthlyBurnRate);

            // 4. Index Calculation
            // Default Weights
            const weights = { runway: 50, sentiment: 20, pipeline: 30 };
            const index = calculateRealSMEIndex({
                runwayDays,
                sentimentScore: latestWeekly?.sentiment || 5, // Default 5
                pipelineStatus: (latestWeekly?.pipelineStatus as PipelineStatus) || "NORMAL"
            }, weights);

            // 5. Payables (Creditors) & Receivables (Debtors)
            const payables = latestMonthly ? (
                Number(latestMonthly.creditors0to30) +
                Number(latestMonthly.creditors31to60) +
                Number(latestMonthly.creditors61to90) +
                Number(latestMonthly.creditors90plus)
            ) : 0;

            const receivables = latestMonthly ? (
                Number(latestMonthly.debtors0to30) +
                Number(latestMonthly.debtors31to60) +
                Number(latestMonthly.debtors61to90) +
                Number(latestMonthly.debtors90plus)
            ) : 0;

            // 6. Top Expense
            let topExpense = null;
            if (latestMonthly?.top5Expenses && Array.isArray(latestMonthly.top5Expenses) && latestMonthly.top5Expenses.length > 0) {
                // Find largest
                // @ts-ignore
                const expenses = latestMonthly.top5Expenses as { name: string, amount: number }[];
                topExpense = expenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
            }

            // 7. Trend (Reverse chronological to chronological)
            const trend = comp.weeklyStats.slice().reverse().map(ws => ({
                date: ws.weekEnding.toISOString().split('T')[0].slice(5), // "MM-DD"
                amount: Number(ws.cashInflow) - Number(ws.cashOutflow) // This is Net Flow, not Balance. 
                // Creating a Balance Trend is hard without opening balance. 
                // Let's us Net Flow for the trend chart for now, labeled as "Net Flow"
            }));

            return {
                id: comp.id,
                name: comp.name,
                industry: comp.industry || "Unassigned",
                realSmeIndex: index,
                burnRate: monthlyBurnRate,
                cashBalance,
                receivables,
                runwayDays,
                sentiment: latestWeekly?.sentiment || 5,
                pipelineStatus: (latestWeekly?.pipelineStatus as PipelineStatus) || "NORMAL",
                cashShortageRisk: latestWeekly?.cashShortageRisk || false,
                payables,
                topExpense,
                cashTrend: trend
            };
        });

        // Sort by Index (Healthiest to Riskiest? Or Riskiest first?)
        // Let's enable sorting in UI, but default to Low Index first (Risk).
        dashboardData.sort((a, b) => a.realSmeIndex - b.realSmeIndex);

        return { success: true, data: dashboardData };

    } catch (error) {
        console.error("Get Portfolio Health Error:", error);
        return { success: false, error: "Failed to fetch portfolio data." };
    }
}
