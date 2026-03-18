"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveValuation(data: any) {
    try {
        // Calculate EV again on server to be safe or just trust client for this MVP
        // EV = (EBITDA * Multiple) - (Liabilities - Assets * 0.1)
        // We'll store the client's estimated value or re-calculate. 
        // For simplicity, let's trust the passed 'estimatedValue' or recalculate a default.

        // Ensure numeric fields are numbers/decimals
        const valuation = await prisma.valuation.create({
            data: {
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

                revenue: data.revenue,
                ebitda: data.ebitda,
                pat: data.pat,
                totalAssets: data.totalAssets,
                totalLiabilities: data.totalLiabilities,
                numberOfEmployees: Number(data.numberOfEmployees) || 0,
                yearsInOperation: Number(data.yearsInOperation) || 0,
                purpose: data.purpose,

                estimatedValue: data.estimatedValue || 0
            }
        });

        return { success: true, id: valuation.id };
    } catch (error) {
        console.error("Error saving valuation:", error);
        return { success: false, error: "Failed to save valuation." };
    }
}

export async function getValuation(id: string) {
    try {
        const valuation = await prisma.valuation.findUnique({
            where: { id }
        });
        return valuation;
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
}) {
    try {
        // 1. Get Base Multipliers for Sector
        const industry = await prisma.industry.findFirst({
            where: { name: data.sector, status: true },
            // @ts-ignore: Prisms types might be stale
            include: { baseMultiplier: true }
        });

        let baseMultFrom = 5.0;
        let baseMultTo = 7.0;
        let isUsingEbitda = false;
        let metricValue = data.revenue;

        if (industry?.baseMultiplier) {
            if (data.ebitda && data.ebitda > 0) {
                baseMultFrom = Number((industry.baseMultiplier as any).ebitdaMultipleFrom);
                baseMultTo = Number((industry.baseMultiplier as any).ebitdaMultipleTo);
                isUsingEbitda = true;
                metricValue = data.ebitda;
            } else {
                baseMultFrom = Number((industry.baseMultiplier as any).revMultipleFrom);
                baseMultTo = Number((industry.baseMultiplier as any).revMultipleTo);
            }
        } else {
            // Fallbacks if no sector matches or no multiplier config exists
            if (data.ebitda && data.ebitda > 0) {
                isUsingEbitda = true;
                metricValue = data.ebitda;
            } else {
                baseMultFrom = 1.0;
                baseMultTo = 2.5; 
            }
        }

        // 2. Apply Modifiers based on inputs
        let modifierFrom = 1.0;
        let modifierTo = 1.0;

        // Age Modifier
        if (data.age === "0-3") { modifierFrom *= 0.9; modifierTo *= 0.8; }
        else if (data.age === "7+") { modifierFrom *= 1.1; modifierTo *= 1.2; }

        // Growth Modifier (Impacts To mostly)
        if (data.revenueGrowth === "High") { modifierTo *= 1.15; modifierFrom *= 1.05; }
        else if (data.revenueGrowth === "Low") { modifierTo *= 0.9; modifierFrom *= 0.95; }

        // Stability Modifier
        if (data.businessStability === "High") { modifierFrom *= 1.1; modifierTo *= 1.1; } 

        // Margin Modifier (Only if using Revenue)
        if (!isUsingEbitda && data.profitMargin) {
            if (data.profitMargin === "High") { modifierFrom *= 1.2; modifierTo *= 1.2; }
            else if (data.profitMargin === "Low") { modifierFrom *= 0.8; modifierTo *= 0.8; }
        }

        // Final Multiple Bounds
        let finalMultFrom = baseMultFrom * modifierFrom;
        let finalMultTo = baseMultTo * modifierTo;

        if (finalMultFrom > finalMultTo) {
            const temp = finalMultFrom;
            finalMultFrom = finalMultTo;
            finalMultTo = temp;
        }

        // 3. Calculate Value
        const valueFrom = metricValue * finalMultFrom;
        const valueTo = metricValue * finalMultTo;

        // Helper to format values elegantly (e.g. 71000000 -> 7.1 Cr)
        const formatValue = (val: number) => {
            if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
            if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)} K`;
            return val.toFixed(0);
        };

        return {
            min: formatValue(valueFrom),
            max: formatValue(valueTo),
            multMin: finalMultFrom.toFixed(1),
            multMax: finalMultTo.toFixed(1),
            industryTypical: `${baseMultFrom}-${baseMultTo}x ${isUsingEbitda ? 'EBITDA' : 'Revenue'}`,
            isUsingEbitda
        };

    } catch (error) {
        console.error("Valuation calculation error:", error);
        return {
            min: "N/A", max: "N/A", multMin: "-", multMax: "-", industryTypical: "-", isUsingEbitda: false
        };
    }
}
