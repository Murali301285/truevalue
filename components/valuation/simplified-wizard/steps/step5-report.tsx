"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, TrendingUp, TrendingDown, Minus, Info, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SimplifiedValuationFormData } from "../schema";
import { calculateAdvancedValuation } from "@/lib/valuationMath";

export function Step5Report({ valuationId, industries }: { valuationId: string | null, industries: any[] }) {
    const { getValues } = useFormContext<SimplifiedValuationFormData>();
    const values = getValues();
    
    // Calculate math
    const valResult = calculateAdvancedValuation(values, industries);

    const formatIndianScale = (num: number) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    const getImpactColor = (impact: number) => impact > 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : impact < 0 ? "text-brand-red bg-red-50 border-red-200" : "text-gray-600 bg-gray-50 border-gray-200";
    const getImpactIcon = (impact: number) => impact > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : impact < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />;
    const getImpactText = (impact: number) => impact > 0 ? `+${impact}%` : impact < 0 ? `${impact}%` : "0%";

    // Benchmark compare
    let rangeSide = "In line";
    if (valResult.adjustedMultiple > valResult.benchmarkHigh) rangeSide = "Above average";
    else if (valResult.adjustedMultiple < valResult.benchmarkLow) rangeSide = "Below average";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-12"
        >
            {/* Block 1: Headline */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                
                <div className="bg-brand-red/5 p-6 md:p-8 rounded-2xl border border-brand-red/10 mt-6 inline-block w-full max-w-2xl mx-auto shadow-sm">
                    <p className="text-sm font-bold text-brand-red tracking-widest uppercase mb-2">Estimated Business Value (Indicative)</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-mono tracking-tight my-4 whitespace-nowrap">
                        {formatIndianScale(valResult.lowValue)} – {formatIndianScale(valResult.highValue)}
                    </h2>
                    <p className="text-gray-600 font-medium">Most Likely Value: <span className="text-gray-900 font-bold">{formatIndianScale(valResult.midValue)}</span></p>
                </div>
            </div>

            {/* Block 2: Valuation Drivers Breakdown */}
            <div className="bg-white border shadow-sm rounded-xl p-6 max-w-3xl mx-auto text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-brand-red" />
                    Valuation Drivers Breakdown
                </h3>
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="text-gray-700 font-medium">Sector base multiple used</span>
                        <span className="font-bold text-gray-900 mt-2 sm:mt-0 bg-white px-3 py-1 rounded shadow-sm border">{valResult.baseMultiple.toFixed(2)}x {valResult.metric}</span>
                    </div>

                    <ul className="space-y-3 px-2">
                        <li className="flex items-center justify-between border-b pb-3">
                            <span className="text-gray-600 text-sm font-medium">Growth adjustment</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.growthImpact)}`}>
                                {getImpactIcon(valResult.growthImpact)} {getImpactText(valResult.growthImpact)}
                            </span>
                        </li>
                        {valResult.metric === "Revenue" && (
                            <li className="flex items-center justify-between border-b pb-3">
                                <span className="text-gray-600 text-sm font-medium">Margin adjustment</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.profitImpact)}`}>
                                    {getImpactIcon(valResult.profitImpact)} {getImpactText(valResult.profitImpact)}
                                </span>
                            </li>
                        )}
                        <li className="flex items-center justify-between border-b pb-3">
                            <span className="text-gray-600 text-sm font-medium">Risk adjustment</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.riskImpact)}`}>
                                {getImpactIcon(valResult.riskImpact)} {getImpactText(valResult.riskImpact)}
                            </span>
                        </li>
                        <li className="flex items-center justify-between pb-3 border-b">
                            <span className="text-gray-600 text-sm font-medium">Age adjustment</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.ageImpact)}`}>
                                {getImpactIcon(valResult.ageImpact)} {getImpactText(valResult.ageImpact)}
                            </span>
                        </li>
                        <li className="flex items-center justify-between pt-2">
                            <span className="text-gray-900 text-base font-bold">Final adjusted multiple</span>
                            <span className="text-gray-900 text-base font-bold">{valResult.adjustedMultiple.toFixed(2)}x</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Block 3: Benchmark Compare */}
            <div className="bg-gray-50 border shadow-sm rounded-xl p-6 text-center max-w-3xl mx-auto">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-2">
                    Typical range for <strong>{values.sector}</strong> businesses in India: <strong>{valResult.benchmarkLow.toFixed(1)}x–{valResult.benchmarkHigh.toFixed(1)}x {valResult.metric}</strong>
                </p>
                <div className="mt-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${rangeSide === 'Above average' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : rangeSide === 'Below average' ? 'text-brand-red bg-red-100 border-red-200' : 'text-blue-700 bg-blue-100 border-blue-200'}`}>
                        {rangeSide}
                    </span>
                </div>
            </div>

            {/* Block 4: CTA UPGRADE */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 max-w-3xl mx-auto text-white shadow-xl relative overflow-hidden text-center md:text-left border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Need a comprehensive report?</h3>
                    <p className="text-gray-300 text-sm">Upgrade to get detailed DCF and 3-5 year projections.</p>
                </div>
                <div className="relative z-10 shrink-0">
                    <Link href={`/report/${valuationId}`}>
                        <Button className="bg-brand-red hover:bg-brand-red/90 text-white font-bold h-12 px-6 shadow-red-500/20 shadow-lg text-sm transition-all hover:scale-105 active:scale-95 border border-red-500 w-full md:w-auto">
                            Get a Detailed Valuation Report
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Back button */}
            <div className="pt-4 text-center">
                <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-brand-red inline-flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </a>
            </div>

            {/* Disclaimers Block */}
            <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    <strong>Disclaimer:</strong> This is an automated indicative estimate based on inputs provided and sector benchmarks. It is not a substitute for a professional valuation under ICAI Valuation Standards or for regulatory / transaction purposes.
                </p>
            </div>

        </motion.div>
    );
}
