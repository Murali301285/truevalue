export type PipelineStatus = "EXCELLENT" | "NORMAL" | "CONCERN";

export function calculateRunwayDays(cashBalance: number, monthlyBurnRate: number): number {
    if (monthlyBurnRate <= 0) return 999;
    return Math.floor((cashBalance / monthlyBurnRate) * 30);
}

export function calculateRealSMEIndex(
    data: { runwayDays: number; sentimentScore: number; pipelineStatus: PipelineStatus },
    weights: { runway: number; sentiment: number; pipeline: number }
): number {
    let score = 50;
    if (data.runwayDays > 180) score += 20;
    else if (data.runwayDays < 30) score -= 20;

    if (data.sentimentScore >= 8) score += 10;
    else if (data.sentimentScore <= 4) score -= 10;

    if (data.pipelineStatus === "EXCELLENT") score += 20;
    else if (data.pipelineStatus === "CONCERN") score -= 20;

    return Math.max(0, Math.min(100, score));
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatIndianNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
    }).format(value);
};
