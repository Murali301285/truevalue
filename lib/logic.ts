export type PipelineStatus = 'LOW' | 'NORMAL' | 'GOOD';

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

export const calculateRunwayDays = (cashBalance: number, monthlyBurnRate: number): number => {
    if (monthlyBurnRate <= 0) return 999; // Infinite runway if no burn
    const months = cashBalance / monthlyBurnRate;
    return Math.round(months * 30);
};

export const calculateRealSMEIndex = (
    data: { runwayDays: number; sentimentScore: number; pipelineStatus: PipelineStatus },
    weights: { runway: number; sentiment: number; pipeline: number }
): number => {
    // 1. Runway Score (0-100)
    // Target: 6 months (180 days) = 100
    let runwayScore = (data.runwayDays / 180) * 100;
    if (runwayScore > 100) runwayScore = 100;

    // 2. Sentiment Score (0-100)
    // Input is 1-10
    const sentimentScore = data.sentimentScore * 10;

    // 3. Pipeline Score (0-100)
    let pipelineScore = 50;
    if (data.pipelineStatus === 'GOOD') pipelineScore = 100;
    if (data.pipelineStatus === 'LOW') pipelineScore = 0;

    // Weighted Average
    const totalScore =
        (runwayScore * (weights.runway / 100)) +
        (sentimentScore * (weights.sentiment / 100)) +
        (pipelineScore * (weights.pipeline / 100));

    return Math.round(totalScore);
};
