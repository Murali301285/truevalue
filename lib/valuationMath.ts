export interface ValuationFactors {
    metric: "EBITDA" | "Revenue";
    metricValue: number;
    baseMultiple: number;
    
    growthFactor: number;
    profitFactor: number;
    riskFactor: number;
    ageFactor: number;
    
    adjustedMultiple: number;
    
    lowValue: number;
    midValue: number;
    highValue: number;

    lowMultiple: number;
    highMultiple: number;

    benchmarkLow: number;
    benchmarkHigh: number;
    
    growthImpact: number;
    profitImpact: number;
    riskImpact: number;
    ageImpact: number;
}

export function calculateAdvancedValuation(
    data: any, 
    industries: any[]
): ValuationFactors {
    
    // 1. Choose Metric
    let metric: "EBITDA" | "Revenue" = "Revenue";
    let metricValue = Number(data.revenue || 0);

    const ebitdaNum = Number(data.ebitda);
    if (!isNaN(ebitdaNum) && ebitdaNum > 0) {
        metric = "EBITDA";
        metricValue = ebitdaNum;
    }

    // 2. Fetch Base Multiple
    const industry = industries.find(i => i.name === data.sector);
    let baseMultiple = 0;
    let benchmarkLow = 0;
    let benchmarkHigh = 0;

    if (industry && industry.baseMultiplier) {
        if (metric === "EBITDA") {
            benchmarkLow = Number(industry.baseMultiplier.ebitdaMultipleFrom || 0);
            benchmarkHigh = Number(industry.baseMultiplier.ebitdaMultipleTo || 0);
        } else {
            benchmarkLow = Number(industry.baseMultiplier.revMultipleFrom || 0);
            benchmarkHigh = Number(industry.baseMultiplier.revMultipleTo || 0);
        }
        // Base multiple is the midpoint
        baseMultiple = (benchmarkLow + benchmarkHigh) / 2;
    }

    // Default fallbacks if missing
    if (baseMultiple === 0) {
        if (metric === "EBITDA") {
            benchmarkLow = 5.0;
            benchmarkHigh = 7.0;
        } else {
            benchmarkLow = 1.2;
            benchmarkHigh = 2.0;
        }
        baseMultiple = (benchmarkLow + benchmarkHigh) / 2;
    }

    // 3. Modifiers Setup
    
    // Growth Factor (GF)
    let growthFactor = 1.0;
    let growthImpact = 0;
    if (data.revenueGrowth === "Low") { growthFactor = 0.9; growthImpact = -10; }
    else if (data.revenueGrowth === "High") { growthFactor = 1.15; growthImpact = 15; }

    // Profitability Factor (PF) - Only if using Revenue as metric
    let profitFactor = 1.0;
    let profitImpact = 0;
    if (metric === "Revenue") {
        if (data.profitMargin === "Low") { profitFactor = 0.9; profitImpact = -10; }
        else if (data.profitMargin === "High") { profitFactor = 1.1; profitImpact = 10; }
    }

    // Risk Factor (RF) - based on Business Stability (Low stability = High Risk)
    let riskFactor = 1.0;
    let riskImpact = 0;
    // Business Stability: Low means high risk (0.85). High means low risk (1.1).
    if (data.businessStability === "Low") { riskFactor = 0.85; riskImpact = -15; }
    else if (data.businessStability === "High") { riskFactor = 1.1; riskImpact = 10; }

    // Age Factor (AF) - business vintage
    let ageFactor = 1.0;
    let ageImpact = 0;
    if (data.age === "0-3") { ageFactor = 0.9; ageImpact = -10; }
    else if (data.age === "7+") { ageFactor = 1.05; ageImpact = 5; }

    // 4. Calculate Adjusted Multiple
    const adjustedMultiple = baseMultiple * growthFactor * profitFactor * riskFactor * ageFactor;

    // 5. Calculate Final Valuation Range
    const midValue = metricValue * adjustedMultiple;
    const lowValue = midValue * 0.9;
    const highValue = midValue * 1.1;

    return {
        metric,
        metricValue,
        baseMultiple,
        
        growthFactor,
        profitFactor,
        riskFactor,
        ageFactor,
        
        adjustedMultiple,
        
        lowValue,
        midValue,
        highValue,

        lowMultiple: adjustedMultiple * 0.9,
        highMultiple: adjustedMultiple * 1.1,

        benchmarkLow,
        benchmarkHigh,

        growthImpact,
        profitImpact,
        riskImpact,
        ageImpact
    };
}
