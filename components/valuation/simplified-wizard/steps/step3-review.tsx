"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/logic";
import { Lock, Zap, FileCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { saveValuation } from "@/app/actions/valuation";
import { SimplifiedValuationFormData } from "../schema";
import { calculateAdvancedValuation } from "@/lib/valuationMath";

export function Step3Review({ onPaymentSuccess, industries }: { onPaymentSuccess: (id: string, calculatedEV: number) => void, industries: any[] }) {
    const { getValues } = useFormContext<SimplifiedValuationFormData>();
    const values = getValues();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        setIsProcessing(true);

        const resultMath = calculateAdvancedValuation(values, industries);
        let ev = resultMath.midValue;
        if (!values.ebitda || ev <= 0) {
            // fallback if no ebitda, just save a 0 EV and let the report page handle fallback multipliers
            ev = 0; 
        }

        // Simulate payment gateway delay
        setTimeout(async () => {
            const result = await saveValuation({
                companyName: "Draft Valuation",
                industry: values.sector || "Other",
                legalStructure: "SME",
                revenue: Number(values.revenue) || 0,
                ebitda: Number(values.ebitda) || 0,
                pat: 0,
                totalAssets: 0,
                totalLiabilities: 0,
                yearsInOperation: values.age === "0-3" ? 2 : values.age === "3-7" ? 5 : 10,
                purpose: "Preliminary Estimate",
                estimatedValue: isNaN(ev) ? 0 : ev,
            });
            setIsProcessing(false);

            if (result.success) {
                toast({ title: "Success", description: "Payment successful. Generating report..." });
                onPaymentSuccess(result.id, ev);
            } else {
                toast({ title: "Error", description: "Failed to save valuation data.", variant: "destructive" });
            }
        }, 1500);
    };

        // Formatter for large Indian currency logic (Cr / L)
        const formatIndianScale = (num: number) => {
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
            return `₹${num.toLocaleString('en-IN')}`;
        };

        const valResult = calculateAdvancedValuation(values, industries);

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-brand-red">Company Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Name:</span>
                            <span className="font-medium text-gray-400 italic">Not Provided</span>
                            <span className="text-gray-500">Industry:</span>
                            <span className="font-medium">{values.sector}</span>
                            <span className="text-gray-500">Age:</span>
                            <span className="font-medium">{values.age} years</span>
                            <span className="text-gray-500">Purpose:</span>
                            <span className="font-medium">Business Valuation</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-brand-red">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Revenue:</span>
                            <span className="font-medium">{formatCurrency(values.revenue || 0)}</span>
                            <span className="text-gray-500">EBITDA:</span>
                            <span className="font-medium">{values.ebitda ? formatCurrency(values.ebitda) : <span className="text-gray-400 italic">N/A</span>}</span>
                            <span className="text-gray-500">Assets:</span>
                            <span className="font-medium text-gray-400 italic">Not Provided</span>
                            <span className="text-gray-500">Liabilities:</span>
                            <span className="font-medium text-gray-400 italic">Not Provided</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Estimated Business Value Range Pill */}
            <div className="mt-8 flex flex-col items-center justify-center space-y-3 bg-white p-8 rounded-2xl border shadow-sm">
                <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase">Your MyValue Estimate</span>
                <div className="bg-brand-red/5 px-8 py-4 rounded-full border border-brand-red/10 text-center">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-brand-red font-mono">
                        Estimated Business Value: {formatIndianScale(valResult.lowValue)} – {formatIndianScale(valResult.highValue)}
                    </h2>
                </div>
                <p className="text-gray-500 text-sm font-medium pt-2">
                    Implied multiple: {valResult.lowMultiple.toFixed(1)}x–{valResult.highMultiple.toFixed(1)}x {valResult.metric} 
                    {" "}(industry typical: {valResult.benchmarkLow.toFixed(1)}–{valResult.benchmarkHigh.toFixed(1)}x for {values.sector || "your sector"} in India)
                </p>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Selected Plan</h3>
                {/* Instant Valuation - Active */}
                <div className="relative bg-white rounded-xl border-2 border-brand-red/80 shadow-sm p-5 transition-all w-full max-w-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-red-50 rounded-lg">
                                <Zap className="w-5 h-5 text-brand-red" />
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-zinc-900 block">₹499</span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Per Report</span>
                            </div>
                        </div>
                        <div className="mb-2">
                            <h3 className="font-bold text-zinc-900 text-lg mb-1">Express Tier</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">Automated enterprise value report with industry benchmarks.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Unlock Your Valuation Report</h3>
                        <p className="text-gray-500 text-sm mb-4">Complete your secure checkout to process the valuation and generate the report.</p>
                        <div className="flex items-center gap-2 text-xs text-brand-red font-medium bg-red-50 w-fit px-3 py-1.5 rounded-full border border-red-100">
                            <Lock className="w-3.5 h-3.5" /> Secure Payment via Razorpay
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Payable</p>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">₹499</h2>
                        <Button
                            size="lg"
                            className="w-full md:w-auto bg-brand-red hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Pay Now & Continue"}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
