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

export function cleanNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    const cleanStr = String(val).replace(/[^\d.-]/g, "").trim();
    const num = Number(cleanStr);
    return isNaN(num) ? 0 : num;
}

export function calculateAdvancedValuation(
    data: any, 
    industries: any[] = [],
    configFactors?: any
): ValuationFactors {
    
    const revenueNum = cleanNumber(data.revenue);
    const ebitdaNum = cleanNumber(data.ebitda);

    // 1. Fetch Multipliers for Sector
    const industry = industries.find(i => i.name === data.sector);
    let baseMultRevFrom = 1.0;
    let baseMultRevTo = 2.5;
    let baseMultEbitdaFrom = 5.0;
    let baseMultEbitdaTo = 7.0;

    if (industry && industry.baseMultiplier) {
        baseMultRevFrom = Number(industry.baseMultiplier.revMultipleFrom || 0);
        baseMultRevTo = Number(industry.baseMultiplier.revMultipleTo || 0);
        baseMultEbitdaFrom = Number(industry.baseMultiplier.ebitdaMultipleFrom || 0);
        baseMultEbitdaTo = Number(industry.baseMultiplier.ebitdaMultipleTo || 0);
    }

    let baseMultipleRev = (baseMultRevFrom + baseMultRevTo) / 2;
    if (baseMultRevFrom === 0) baseMultipleRev = baseMultRevTo;

    let baseMultipleEbitda = (baseMultEbitdaFrom + baseMultEbitdaTo) / 2;
    if (baseMultEbitdaFrom === 0) baseMultipleEbitda = baseMultEbitdaTo;

    // 2. Modifiers Setup
    const f = configFactors || {
        growthLow: 0.9, growthMed: 1.0, growthHigh: 1.15,
        marginLow: 0.9, marginMed: 1.0, marginHigh: 1.1,
        riskHigh: 0.85, riskMed: 1.0, riskLow: 1.1,
        age0to3: 0.9, age3to7: 1.0, age7plus: 1.05
    };

    // Growth Factor (GF)
    let growthFactor = Number(f.growthMed);
    if (data.revenueGrowth === "Low") { growthFactor = Number(f.growthLow); }
    else if (data.revenueGrowth === "High") { growthFactor = Number(f.growthHigh); }

    // Margin Factor (MF)
    let profitFactor = Number(f.marginMed);
    if (data.profitMargin === "Low") { profitFactor = Number(f.marginLow); }
    else if (data.profitMargin === "High") { profitFactor = Number(f.marginHigh); }

    // Risk Factor (RF)
    let riskFactor = Number(f.riskMed);
    if (data.businessStability === "Low") { riskFactor = Number(f.riskHigh); }
    else if (data.businessStability === "High") { riskFactor = Number(f.riskLow); }

    // Age Factor (AF)
    let ageFactor = Number(f.age3to7);
    if (data.age === "0-3") { ageFactor = Number(f.age0to3); }
    else if (data.age === "7+") { ageFactor = Number(f.age7plus); }

    // Calculate Adjusted Multiples
    let adjustedMultipleRev = baseMultipleRev * growthFactor * profitFactor * riskFactor * ageFactor;
    if (adjustedMultipleRev < 0.5) adjustedMultipleRev = 0.5;
    if (adjustedMultipleRev > 4.0) adjustedMultipleRev = 4.0;

    let adjustedMultipleEbitda = baseMultipleEbitda * growthFactor * riskFactor * ageFactor;
    if (adjustedMultipleEbitda < 3.0) adjustedMultipleEbitda = 3.0;
    if (adjustedMultipleEbitda > 10.0) adjustedMultipleEbitda = 10.0;

    // 3. Choose Metric and Calculate Base EV
    let metric: "EBITDA" | "Revenue" = "Revenue";
    let metricValue = revenueNum;
    let baseMultiple = baseMultipleRev;
    let adjustedMultiple = adjustedMultipleRev;

    let midValue = 0;
    let lowValue = 0;
    let highValue = 0;

    if (ebitdaNum > 0) {
        // Profitable: Use EBITDA directly
        metric = "EBITDA";
        metricValue = ebitdaNum;
        baseMultiple = baseMultipleEbitda;
        adjustedMultiple = adjustedMultipleEbitda;
        
        midValue = metricValue * adjustedMultiple * 1.00;
        lowValue = metricValue * adjustedMultiple * 0.90;
        highValue = metricValue * adjustedMultiple * 1.10;
    } else if (ebitdaNum < 0) {
        // Unprofitable (Negative EBITDA): Blended Valuation to penalize operating loss (do not skip EBITDA)
        metric = "Revenue";
        metricValue = revenueNum;
        baseMultiple = baseMultipleRev;
        adjustedMultiple = adjustedMultipleRev;

        const revVal = revenueNum * adjustedMultipleRev;
        const ebitdaPenalty = ebitdaNum * adjustedMultipleEbitda; // Note: ebitdaNum is negative, so this naturally subtracts
        
        const blendedEV = revVal + ebitdaPenalty;
        midValue = blendedEV > 0 ? blendedEV : 0;
        lowValue = (blendedEV * 0.90) > 0 ? (blendedEV * 0.90) : 0;
        highValue = (blendedEV * 1.10) > 0 ? (blendedEV * 1.10) : 0;
    } else {
        // EBITDA is 0 or undefined: Standard Revenue valuation
        metric = "Revenue";
        metricValue = revenueNum;
        baseMultiple = baseMultipleRev;
        adjustedMultiple = adjustedMultipleRev;

        midValue = metricValue * adjustedMultiple * 1.00;
        lowValue = metricValue * adjustedMultiple * 0.90;
        highValue = metricValue * adjustedMultiple * 1.10;
    }

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

        benchmarkLow: metric === "EBITDA" ? baseMultEbitdaFrom : baseMultRevFrom,
        benchmarkHigh: metric === "EBITDA" ? baseMultEbitdaTo : baseMultRevTo,

        growthImpact: Math.round((growthFactor - 1) * 100),
        profitImpact: Math.round((profitFactor - 1) * 100),
        riskImpact: Math.round((riskFactor - 1) * 100),
        ageImpact: Math.round((ageFactor - 1) * 100)
    };
}
