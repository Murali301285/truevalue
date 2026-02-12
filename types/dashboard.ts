import { PipelineStatus } from "@/lib/logic";

export type CompanyHealthData = {
    id: string;
    name: string;
    industry: string;

    // Calculated Score
    realSmeIndex: number;

    // Derived from Stats
    burnRate: number; // Weekly or Monthly Average
    cashBalance: number; // Cash on Hand + Bank
    receivables: number; // Total Debtors
    runwayDays: number; // Calculated Runway

    // Weekly Pulse
    sentiment: number;
    pipelineStatus: PipelineStatus;
    cashShortageRisk: boolean;

    // Monthly Deep Dive
    payables: number; // Total Creditors
    topExpense: { name: string; amount: number } | null;

    // Trend (Last 6 weeks/months cash)
    cashTrend: { date: string; amount: number }[];
};
