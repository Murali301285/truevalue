"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, TrendingUp, TrendingDown, Minus, Info, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SimplifiedValuationFormData } from "../schema";
import { calculateAdvancedValuation } from "@/lib/valuationMath";

export function Step4Report({ valuationId, industries }: { valuationId: string | null, industries: any[] }) {
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
    const getImpactText = (impact: number) => impact > 0 ? `+${impact}%` : impact < 0 ? `${impact}%` : "No change";

    // "your score suggests the [higher/lower/middle] side of the range."
    let rangeSide = "middle";
    if (valResult.adjustedMultiple > valResult.benchmarkHigh) rangeSide = "higher";
    else if (valResult.adjustedMultiple < valResult.benchmarkLow) rangeSide = "lower";

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your instant MSME valuation (indicative)</h1>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">Based on your latest financials and sector benchmarks.</p>
                
                <div className="bg-brand-red/5 p-8 rounded-2xl border border-brand-red/10 mt-6 inline-block min-w-[300px] w-full max-w-xl mx-auto shadow-sm">
                    <p className="text-sm font-bold text-brand-red tracking-widest uppercase mb-2">Estimated Value</p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-mono tracking-tight">
                        {formatIndianScale(valResult.midValue)}
                    </h2>
                    <div className="mt-4 inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-semibold text-gray-700">
                        {formatIndianScale(valResult.lowValue)} <span className="text-gray-300">|</span> {formatIndianScale(valResult.highValue)}
                    </div>
                </div>
            </div>

            {/* Block 2: What drove this valuation? */}
            <div className="bg-white border shadow-sm rounded-xl p-6 max-w-3xl mx-auto text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-brand-red" />
                    What drove this valuation?
                </h3>
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <span className="text-gray-700 font-medium">Base multiple for {values.sector || "your"} industry</span>
                        <span className="font-bold text-gray-900 mt-2 sm:mt-0 bg-white px-3 py-1 rounded shadow-sm border">{valResult.baseMultiple.toFixed(1)}x {valResult.metric}</span>
                    </div>

                    <ul className="space-y-3 px-2">
                        <li className="flex items-center justify-between border-b pb-3">
                            <span className="text-gray-600 text-sm font-medium">Growth: {values.revenueGrowth || "High"}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.growthImpact)}`}>
                                {getImpactIcon(valResult.growthImpact)} {getImpactText(valResult.growthImpact)}
                            </span>
                        </li>
                        {valResult.metric === "Revenue" && (
                            <li className="flex items-center justify-between border-b pb-3">
                                <span className="text-gray-600 text-sm font-medium">Profit Margin: {values.profitMargin || "Medium"}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.profitImpact)}`}>
                                    {getImpactIcon(valResult.profitImpact)} {getImpactText(valResult.profitImpact)}
                                </span>
                            </li>
                        )}
                        <li className="flex items-center justify-between border-b pb-3">
                            <span className="text-gray-600 text-sm font-medium">Business Stability / Risk: {values.businessStability || "Medium"}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.riskImpact)}`}>
                                {getImpactIcon(valResult.riskImpact)} {getImpactText(valResult.riskImpact)}
                            </span>
                        </li>
                        <li className="flex items-center justify-between pb-1">
                            <span className="text-gray-600 text-sm font-medium">Age of Business: {values.age || "3-7"} years</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getImpactColor(valResult.ageImpact)}`}>
                                {getImpactIcon(valResult.ageImpact)} {getImpactText(valResult.ageImpact)}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Block 3: Benchmark Compare */}
            <div className="bg-gray-50 border shadow-sm rounded-xl p-6 text-center max-w-3xl mx-auto">
                <h3 className="text-xs font-extrabold text-gray-500 mb-3 uppercase tracking-wider">How this compares</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                    Typical range for businesses like yours: <strong>{valResult.benchmarkLow.toFixed(1)}–{valResult.benchmarkHigh.toFixed(1)}x {valResult.metric}</strong> in India; your score suggests the <strong className="text-brand-red underline decoration-brand-red/30 underline-offset-4 decoration-2">{rangeSide}</strong> side of the range.
                </p>
            </div>

            {/* Block 4: CTA UPGRADE */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 max-w-3xl mx-auto text-white shadow-xl relative overflow-hidden text-left border border-gray-700">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <FileSpreadsheet className="w-32 h-32" />
                </div>
                <div className="relative z-10 md:w-3/4">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Need a CA-grade or investor-ready report?</h3>
                    <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-400 shrink-0" /> Detailed DCF and 3–5 year projections.</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-400 shrink-0" /> Asset, debt and working capital adjustments.</li>
                        <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-400 shrink-0" /> Scenario and sensitivity analysis.</li>
                    </ul>
                    <Link href="/dashboard/upgrade">
                        <Button className="bg-brand-red hover:bg-brand-red/90 text-white font-bold h-12 px-6 shadow-red-500/20 shadow-lg text-sm transition-all hover:scale-105 active:scale-95 border border-red-500">
                            Upgrade for Detailed Valuation Report
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Back button */}
            <div className="pt-4 text-center">
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-brand-red inline-flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>

            {/* Disclaimers Block */}
            <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-200">
                <p className="text-[11px] text-gray-400 text-justify mb-2 leading-relaxed">
                    <strong>Disclaimer:</strong> This is an automated, high-level estimate based on inputs provided and market heuristics. It is <strong>not</strong> a substitute for a professional valuation report under ICAI Valuation Standards or for regulatory/transaction purposes.
                </p>
                <p className="text-[11px] text-gray-400 text-justify leading-relaxed">
                    Multiples and ranges are derived from public market and SME transaction data for Indian sectors and updated periodically.
                </p>
            </div>

        </motion.div>
    );
}
