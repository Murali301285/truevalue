"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cleanNumber } from "@/lib/valuationMath";

export async function saveValuation(data: any) {
    try {
        const session = await auth();
        const userEmail = session?.user?.email || null;

        // Ensure numeric fields are numbers/decimals
        const valuation = await prisma.valuation.create({
            data: {
                userEmail: userEmail,
                companyName: data.companyName,
                industry: data.industry,
                legalStructure: data.legalStructure,
                incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : null,

                addressLine1: data.addressLine1,
                city: data.city,
                state: data.state,
                pincode: data.pincode,

                pan: data.pan,
                gstNo: data.gstNo,
                cin: data.cin,

                revenue: cleanNumber(data.revenue),
                ebitda: cleanNumber(data.ebitda),
                pat: cleanNumber(data.pat),
                totalAssets: cleanNumber(data.totalAssets),
                totalLiabilities: cleanNumber(data.totalLiabilities),
                numberOfEmployees: Number(data.numberOfEmployees) || 0,
                yearsInOperation: Number(data.yearsInOperation) || 0,
                purpose: data.purpose,

                estimatedValue: cleanNumber(data.estimatedValue)
            }
        });

        revalidatePath("/dashboard");

        return { success: true, id: valuation.id };
    } catch (error) {
        console.error("Error saving valuation:", error);
        return { success: false, error: "Failed to save valuation." };
    }
}

export async function getUserValuations() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return [];
        }

        const isAdmin = (session.user as any).role === 'ADMIN';

        if (isAdmin) {
            const allValuations = await prisma.valuation.findMany({
                orderBy: { createdAt: 'desc' }
            });
            // Convert Decimals to Numbers for client component compatibility
            return allValuations.map(val => ({
                ...val,
                revenue: Number(val.revenue),
                ebitda: Number(val.ebitda),
                pat: Number(val.pat),
                totalAssets: Number(val.totalAssets),
                totalLiabilities: Number(val.totalLiabilities),
                estimatedValue: Number(val.estimatedValue)
            }));
        }

        const userValuations = await prisma.valuation.findMany({
            where: { userEmail: session.user.email },
            orderBy: { createdAt: 'desc' }
        });
        return userValuations.map(val => ({
            ...val,
            revenue: Number(val.revenue),
            ebitda: Number(val.ebitda),
            pat: Number(val.pat),
            totalAssets: Number(val.totalAssets),
            totalLiabilities: Number(val.totalLiabilities),
            estimatedValue: Number(val.estimatedValue)
        }));
    } catch (error) {
        console.error("Error fetching user valuations:", error);
        return [];
    }
}

export async function getValuation(id: string) {
    try {
        const valuation = await prisma.valuation.findUnique({
            where: { id }
        });
        if (!valuation) return null;
        return {
            ...valuation,
            revenue: Number(valuation.revenue),
            ebitda: Number(valuation.ebitda),
            pat: Number(valuation.pat),
            totalAssets: Number(valuation.totalAssets),
            totalLiabilities: Number(valuation.totalLiabilities),
            estimatedValue: Number(valuation.estimatedValue)
        };
    } catch (error) {
        console.error("Error fetching valuation:", error);
        return null;
    }
}

export async function calculateSimplifiedValuation(data: {
    sector: string;
    age: string;
    revenue: number;
    ebitda?: number | null;
    revenueGrowth?: string;
    profitMargin?: string;
    businessStability?: string;
    planName?: string;
}) {
    try {
        // 1. Get Base Multipliers for Sector
        const industry = await prisma.industry.findFirst({
            where: { name: data.sector, status: true },
            // @ts-ignore: Prisms types might be stale
            include: { baseMultiplier: true }
        });

        let baseMultRevFrom = 1.0;
        let baseMultRevTo = 2.5;
        let baseMultEbitdaFrom = 5.0;
        let baseMultEbitdaTo = 7.0;

        if (industry?.baseMultiplier) {
            baseMultRevFrom = Number((industry.baseMultiplier as any).revMultipleFrom || 0);
            baseMultRevTo = Number((industry.baseMultiplier as any).revMultipleTo || 0);
            baseMultEbitdaFrom = Number((industry.baseMultiplier as any).ebitdaMultipleFrom || 0);
            baseMultEbitdaTo = Number((industry.baseMultiplier as any).ebitdaMultipleTo || 0);
        }

        let baseMidRev = (baseMultRevFrom + baseMultRevTo) / 2;
        if (baseMultRevFrom === 0) baseMidRev = baseMultRevTo;

        let baseMidEbitda = (baseMultEbitdaFrom + baseMultEbitdaTo) / 2;
        if (baseMultEbitdaFrom === 0) baseMidEbitda = baseMultEbitdaTo;

        // 2. Fetch Plan Configuration for Modifiers
        const planName = data.planName || "Express";
        let f = await prisma.planValuationFactor.findUnique({
            where: { planName }
        });

        // Fallback if not configured yet
        if (!f) {
            f = {
                growthLow: 0.90, growthMed: 1.00, growthHigh: 1.15,
                marginLow: 0.90, marginMed: 1.00, marginHigh: 1.10,
                riskHigh: 0.85, riskMed: 1.00, riskLow: 1.10,
                age0to3: 0.90, age3to7: 1.00, age7plus: 1.05
            } as any;
        }

        // Apply Modifiers
        let overallModifierRev = 1.0;
        // Age Factor
        if (data.age === "0-3") { overallModifierRev *= Number(f.age0to3); }
        else if (data.age === "7+") { overallModifierRev *= Number(f.age7plus); }
        else { overallModifierRev *= Number(f.age3to7); }

        // Growth Factor
        if (data.revenueGrowth === "High") { overallModifierRev *= Number(f.growthHigh); }
        else if (data.revenueGrowth === "Low") { overallModifierRev *= Number(f.growthLow); }
        else { overallModifierRev *= Number(f.growthMed); }

        // Risk Factor
        if (data.businessStability === "High") { overallModifierRev *= Number(f.riskLow); }
        else if (data.businessStability === "Low") { overallModifierRev *= Number(f.riskHigh); }
        else { overallModifierRev *= Number(f.riskMed); }

        let overallModifierEbitda = overallModifierRev;

        // Margin Factor (Revenue gets Margin Factor)
        if (data.profitMargin === "High") { overallModifierRev *= Number(f.marginHigh); }
        else if (data.profitMargin === "Low") { overallModifierRev *= Number(f.marginLow); }
        else { overallModifierRev *= Number(f.marginMed); }

        // Adjusted Multiples
        let adjustedMultipleRev = baseMidRev * overallModifierRev;
        if (adjustedMultipleRev < 0.5) adjustedMultipleRev = 0.5;
        if (adjustedMultipleRev > 4.0) adjustedMultipleRev = 4.0;

        let adjustedMultipleEbitda = baseMidEbitda * overallModifierEbitda;
        if (adjustedMultipleEbitda < 3.0) adjustedMultipleEbitda = 3.0;
        if (adjustedMultipleEbitda > 10.0) adjustedMultipleEbitda = 10.0;

        let valueLow = 0;
        let valueMid = 0;
        let valueHigh = 0;
        let isUsingEbitda = false;
        let metricValue = data.revenue;
        let baseMid = baseMidRev;
        let adjustedMultiple = adjustedMultipleRev;

        const ebitdaVal = data.ebitda ? Number(data.ebitda) : 0;
        let ebitdaPenalty: number | undefined = undefined;
        let adjustedMultipleEbitdaVal: string | undefined = undefined;

        if (ebitdaVal > 0) {
            isUsingEbitda = true;
            metricValue = ebitdaVal;
            baseMid = baseMidEbitda;
            adjustedMultiple = adjustedMultipleEbitda;

            valueLow = metricValue * adjustedMultiple * 0.90;
            valueMid = metricValue * adjustedMultiple * 1.00;
            valueHigh = metricValue * adjustedMultiple * 1.10;
        } else if (ebitdaVal < 0) {
            isUsingEbitda = false;
            metricValue = data.revenue;
            baseMid = baseMidRev;
            adjustedMultiple = adjustedMultipleRev;

            const revVal = data.revenue * adjustedMultipleRev;
            ebitdaPenalty = ebitdaVal * adjustedMultipleEbitda; // EBITDA is negative, so this naturally subtracts
            adjustedMultipleEbitdaVal = adjustedMultipleEbitda.toFixed(2);

            const blendedEV = revVal + ebitdaPenalty;
            valueMid = blendedEV > 0 ? blendedEV : 0;
            valueLow = (blendedEV * 0.90) > 0 ? (blendedEV * 0.90) : 0;
            valueHigh = (blendedEV * 1.10) > 0 ? (blendedEV * 1.10) : 0;
        } else {
            isUsingEbitda = false;
            metricValue = data.revenue;
            baseMid = baseMidRev;
            adjustedMultiple = adjustedMultipleRev;

            valueLow = metricValue * adjustedMultiple * 0.90;
            valueMid = metricValue * adjustedMultiple * 1.00;
            valueHigh = metricValue * adjustedMultiple * 1.10;
        }

        return {
            min: valueLow,
            mid: valueMid,
            max: valueHigh,
            
            breakdown: {
                metric: isUsingEbitda ? "EBITDA" : "Revenue",
                metricValue: metricValue,
                baseMultiple: baseMid.toFixed(2),
                
                // Adjustment Factors
                gf: data.revenueGrowth === "High" ? Number(f.growthHigh) : data.revenueGrowth === "Low" ? Number(f.growthLow) : Number(f.growthMed),
                mf: isUsingEbitda ? 1.00 : (data.profitMargin === "High" ? Number(f.marginHigh) : data.profitMargin === "Low" ? Number(f.marginLow) : Number(f.marginMed)),
                rf: data.businessStability === "High" ? Number(f.riskLow) : data.businessStability === "Low" ? Number(f.riskHigh) : Number(f.riskMed),
                af: data.age === "0-3" ? Number(f.age0to3) : data.age === "7+" ? Number(f.age7plus) : Number(f.age3to7),
                
                adjustedMultiple: adjustedMultiple.toFixed(2),
                
                // Penalty fields
                ebitdaPenalty: ebitdaPenalty,
                ebitdaVal: ebitdaVal,
                adjustedEbitdaMultiple: adjustedMultipleEbitdaVal,
                
                valLow: valueLow,
                valMid: valueMid,
                valHigh: valueHigh
            }
        };

    } catch (error) {
        console.error("Valuation calculation error:", error);
        return {
            min: 0, mid: 0, max: 0, breakdown: null
        };
    }
}
