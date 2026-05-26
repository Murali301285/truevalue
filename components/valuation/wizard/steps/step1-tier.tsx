"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, FileCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function Step1Tier() {
    const { register, watch, setValue } = useFormContext();
    const selectedTier = watch("tier");

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Valuation Tier</h2>
                <p className="text-gray-500">Select the plan that best fits the depth of analysis you require.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Instant Valuation - Active */}
                <div
                    onClick={() => setValue("tier", "express", { shouldValidate: true })}
                    className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer group overflow-hidden ${selectedTier === "express" ? "border-brand-red bg-red-50/20 shadow-lg shadow-red-100" : "border-gray-200 bg-white hover:border-red-200 hover:shadow-md"}`}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-16 h-16 text-brand-red" />
                    </div>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${selectedTier === "express" ? "bg-red-100" : "bg-red-50 group-hover:bg-red-100"}`}>
                                <Zap className="w-6 h-6 text-brand-red" />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-extrabold text-zinc-900 block">₹499</span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Per Report</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow relative z-10">
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Express</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">Automated enterprise value report with industry benchmarks. Instant calculation for indicative use.</p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedTier === "express" ? "border-brand-red bg-brand-red" : "border-gray-300 bg-white"}`}>
                                {selectedTier === "express" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                            </div>
                            <span className={`font-semibold text-sm ${selectedTier === "express" ? "text-brand-red" : "text-gray-500"}`}>Select Express</span>
                        </div>
                    </div>
                </div>

                {/* Standard Valuation - Coming Soon */}
                <div className="relative bg-zinc-50 rounded-xl border border-zinc-200 p-6 opacity-70 cursor-not-allowed">
                    <div className="absolute top-3 right-3">
                        <span className="bg-white text-yellow-600 border border-yellow-200 shadow-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="flex flex-col h-full opacity-60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-200 rounded-xl grayscale">
                                <FileCheck className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-extrabold text-zinc-500 block">₹4,999</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow">
                            <h3 className="text-xl font-bold text-zinc-600 mb-2">Standard</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">Includes document upload, OCR data extraction & analyst review for loan submissions.</p>
                        </div>
                    </div>
                </div>

                {/* Certified Valuation - Coming Soon */}
                <div className="relative bg-zinc-50 rounded-xl border border-zinc-200 p-6 opacity-70 cursor-not-allowed">
                    <div className="absolute top-3 right-3">
                        <span className="bg-white text-yellow-600 border border-yellow-200 shadow-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="flex flex-col h-full opacity-60">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-200 rounded-xl grayscale">
                                <ShieldCheck className="w-6 h-6 text-zinc-600" />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-extrabold text-zinc-500 block">₹14,999</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow">
                            <h3 className="text-xl font-bold text-zinc-600 mb-2">Certified</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">Comprehensive audit, compliance checking, and official CA/RV certification for stamp duty.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden field for validation error anchor */}
            <input type="hidden" {...register("tier")} />
        </motion.div>
    );
}
